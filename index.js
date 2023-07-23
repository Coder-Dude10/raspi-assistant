"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialPortStream = exports.DisconnectedError = void 0;
const stream_1 = require("stream");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('serialport/stream');
class DisconnectedError extends Error {
    constructor(message) {
        super(message);
        this.disconnected = true;
    }
}
exports.DisconnectedError = DisconnectedError;
const defaultSetFlags = {
    brk: false,
    cts: false,
    dtr: true,
    rts: true,
};
function allocNewReadPool(poolSize) {
    const pool = Buffer.allocUnsafe(poolSize);
    pool.used = 0;
    return pool;
}
class SerialPortStream extends stream_1.Duplex {
    /**
     * Create a new serial port object for the `path`. In the case of invalid arguments or invalid options, when constructing a new SerialPort it will throw an error. The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in the next tick. You can disable this by setting the option `autoOpen` to `false`.
     * @emits open
     * @emits data
     * @emits close
     * @emits error
     */
    constructor(options, openCallback) {
        const settings = {
            autoOpen: true,
            endOnClose: false,
            highWaterMark: 64 * 1024,
            ...options,
        };
        super({
            highWaterMark: settings.highWaterMark,
        });
        if (!settings.binding) {
            throw new TypeError('"Bindings" is invalid pass it as `options.binding`');
        }
        if (!settings.path) {
            throw new TypeError(`"path" is not defined: ${settings.path}`);
        }
        if (typeof settings.baudRate !== 'number') {
            throw new TypeError(`"baudRate" must be a number: ${settings.baudRate}`);
        }
        this.settings = settings;
        this.opening = false;
        this.closing = false;
        this._pool = allocNewReadPool(this.settings.highWaterMark);
        this._kMinPoolSpace = 128;
        if (this.settings.autoOpen) {
            this.open(openCallback);
        }
    }
    get path() {
        return this.settings.path;
    }
    get baudRate() {
        return this.settings.baudRate;
    }
    get isOpen() {
        return true;
    }
    _error(error, callback) {
        if (callback) {
            callback.call(this, error);
        }
        else {
            this.emit('error', error);
        }
    }
    _asyncError(error, callback) {
        process.nextTick(() => this._error(error, callback));
    }
    /**
     * Opens a connection to the given serial port.
     * @param {ErrorCallback=} openCallback - Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event.
     * @emits open
     */
    open(openCallback) {
        if (this.isOpen) {
            return this._asyncError(new Error('Port is already open'), openCallback);
        }
        if (this.opening) {
            return this._asyncError(new Error('Port is opening'), openCallback);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { highWaterMark, binding, autoOpen, endOnClose, ...openOptions } = this.settings;
        this.opening = true;
        debug('opening', `path: ${this.path}`);
        this.settings.binding.open(openOptions).then(port => {
            debug('opened', `path: ${this.path}`);
            this.port = port;
            this.opening = false;
            this.emit('open');
            if (openCallback) {
                openCallback.call(this, null);
            }
        }, err => {
            this.opening = false;
            debug('Binding #open had an error', err);
            this._error(err, openCallback);
        });
    }
    /**
     * Changes the baud rate for an open port. Emits an error or calls the callback if the baud rate isn't supported.
     * @param {object=} options Only supports `baudRate`.
     * @param {number=} [options.baudRate] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
     * @param {ErrorCallback=} [callback] Called once the port's baud rate changes. If `.update` is called without a callback, and there is an error, an error event is emitted.
     * @returns {undefined}
     */
    update(options, callback) {
        if (!this.isOpen || !this.port) {
            debug('update attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        debug('update', `baudRate: ${options.baudRate}`);
        this.port.update(options).then(() => {
            debug('binding.update', 'finished');
            this.settings.baudRate = options.baudRate;
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug('binding.update', 'error', err);
            return this._error(err, callback);
        });
    }
    write(data, encoding, callback) {
        if (Array.isArray(data)) {
            data = Buffer.from(data);
        }
        if (typeof encoding === 'function') {
            return super.write(data, encoding);
        }
        return super.write(data, encoding, callback);
    }
    _write(data, encoding, callback) {
        if (!this.isOpen || !this.port) {
            this.once('open', () => {
                this._write(data, encoding, callback);
            });
            return;
        }
        debug('_write', `${data.length} bytes of data`);
        this.port.write(data).then(() => {
            debug('binding.write', 'write finished');
            callback(null);
        }, err => {
            debug('binding.write', 'error', err);
            if (!err.canceled) {
                this._disconnected(err);
            }
            callback(err);
        });
    }
    _writev(data, callback) {
        debug('_writev', `${data.length} chunks of data`);
        const dataV = data.map(write => write.chunk);
        this._write(Buffer.concat(dataV), undefined, callback);
    }
    _read(bytesToRead) {
        if (!this.isOpen || !this.port) {
            debug('_read', 'queueing _read for after open');
            this.once('open', () => {
                this._read(bytesToRead);
            });
            return;
        }
        if (!this._pool || this._pool.length - this._pool.used < this._kMinPoolSpace) {
            debug('_read', 'discarding the read buffer pool because it is below kMinPoolSpace');
            this._pool = allocNewReadPool(this.settings.highWaterMark);
        }
        // Grab another reference to the pool in the case that while we're
        // in the thread pool another read() finishes up the pool, and
        // allocates a new one.
        const pool = this._pool;
        // Read the smaller of rest of the pool or however many bytes we want
        const toRead = Math.min(pool.length - pool.used, bytesToRead);
        const start = pool.used;
        // the actual read.
        debug('_read', `reading`, { start, toRead });
        this.port.read(pool, start, toRead).then(({ bytesRead }) => {
            debug('binding.read', `finished`, { bytesRead });
            // zero bytes means read means we've hit EOF? Maybe this should be an error
            if (bytesRead === 0) {
                debug('binding.read', 'Zero bytes read closing readable stream');
                this.push(null);
                return;
            }
            pool.used += bytesRead;
            this.push(pool.slice(start, start + bytesRead));
        }, err => {
            debug('binding.read', `error`, err);
            if (!err.canceled) {
                this._disconnected(err);
            }
            this._read(bytesToRead); // prime to read more once we're reconnected
        });
    }
    _disconnected(err) {
        if (!this.isOpen) {
            debug('disconnected aborted because already closed', err);
            return;
        }
        debug('disconnected', err);
        this.close(undefined, new DisconnectedError(err.message));
    }
    /**
     * Closes an open connection.
     *
     * If there are in progress writes when the port is closed the writes will error.
     * @param {ErrorCallback} callback Called once a connection is closed.
     * @param {Error} disconnectError used internally to propagate a disconnect error
     */
    close(callback, disconnectError = null) {
        if (!this.isOpen || !this.port) {
            debug('close attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        this.closing = true;
        debug('#close');
        this.port.close().then(() => {
            this.closing = false;
            debug('binding.close', 'finished');
            this.emit('close', disconnectError);
            if (this.settings.endOnClose) {
                this.emit('end');
            }
            if (callback) {
                callback.call(this, disconnectError);
            }
        }, err => {
            this.closing = false;
            debug('binding.close', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for OS X and Linux.
     *
     * All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options is used.
     */
    set(options, callback) {
        if (!this.isOpen || !this.port) {
            debug('set attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        const settings = { ...defaultSetFlags, ...options };
        debug('#set', settings);
        this.port.set(settings).then(() => {
            debug('binding.set', 'finished');
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug('binding.set', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Returns the control flags (CTS, DSR, DCD) on the open port.
     * Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
     */
    get(callback) {
        if (!this.isOpen || !this.port) {
            debug('get attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        debug('#get');
        this.port.get().then(status => {
            debug('binding.get', 'finished');
            callback.call(this, null, status);
        }, err => {
            debug('binding.get', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Flush discards data received but not read, and written but not transmitted by the operating system. For more technical details, see [`tcflush(fd, TCIOFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.
     */
    flush(callback) {
        if (!this.isOpen || !this.port) {
            debug('flush attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        debug('#flush');
        this.port.flush().then(() => {
            debug('binding.flush', 'finished');
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug('binding.flush', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Waits until all output data is transmitted to the serial port. After any pending write has completed it calls [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) to ensure it has been written to the device.
    * @example
    Write the `data` and wait until it has finished transmitting to the target serial port before calling the callback. This will queue until the port is open and writes are finished.
  
    ```js
    function writeAndDrain (data, callback) {
      port.write(data);
      port.drain(callback);
    }
    ```
    */
    drain(callback) {
        debug('drain');
        if (!this.isOpen || !this.port) {
            debug('drain queuing on port open');
            this.once('open', () => {
                this.drain(callback);
            });
            return;
        }
        this.port.drain().then(() => {
            debug('binding.drain', 'finished');
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug('binding.drain', 'had an error', err);
            return this._error(err, callback);
        });
    }
}
exports.SerialPortStream = SerialPortStream;
/**
 * The `error` event's callback is called with an error object whenever there is an error.
 * @event error
 */
/**
 * The `open` event's callback is called with no arguments when the port is opened and ready for writing. This happens if you have the constructor open immediately (which opens in the next tick) or if you open the port manually with `open()`. See [Useage/Opening a Port](#opening-a-port) for more information.
 * @event open
 */
/**
 * Request a number of bytes from the SerialPort. The `read()` method pulls some data out of the internal buffer and returns it. If no data is available to be read, null is returned. By default, the data is returned as a `Buffer` object unless an encoding has been specified using the `.setEncoding()` method.
 * @method SerialPort.prototype.read
 * @param {number=} size Specify how many bytes of data to return, if available
 * @returns {(string|Buffer|null)} The data from internal buffers
 */
/**
 * Listening for the `data` event puts the port in flowing mode. Data is emitted as soon as it's received. Data is a `Buffer` object with a varying amount of data in it. The `readLine` parser converts the data into string lines. See the [parsers](https://serialport.io/docs/api-parsers-overview) section for more information on parsers, and the [Node.js stream documentation](https://nodejs.org/api/stream.html#stream_event_data) for more information on the data event.
 * @event data
 */
/**
 * The `close` event's callback is called with no arguments when the port is closed. In the case of a disconnect it will be called with a Disconnect Error object (`err.disconnected == true`). In the event of a close error (unlikely), an error event is triggered.
 * @event close
 */
/**
 * The `pause()` method causes a stream in flowing mode to stop emitting 'data' events, switching out of flowing mode. Any data that becomes available remains in the internal buffer.
 * @method SerialPort.prototype.pause
 * @see resume
 * @returns `this`
 */
/**
 * The `resume()` method causes an explicitly paused, `Readable` stream to resume emitting 'data' events, switching the stream into flowing mode.
 * @method SerialPort.prototype.resume
 * @see pause
 * @returns `this`
 */
