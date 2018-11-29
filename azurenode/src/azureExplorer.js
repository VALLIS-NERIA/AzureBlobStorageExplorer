"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_blob_1 = require("@azure/storage-blob");
exports.delimiter = "/";
class Storage {
    constructor(SASURL) {
        this.anonCred = new storage_blob_1.AnonymousCredential();
        this.pipeline = storage_blob_1.StorageURL.newPipeline(this.anonCred);
        this.url = SASURL;
        this.serviceURL = new storage_blob_1.ServiceURL(this.url, this.pipeline);
    }
    getContainers() {
        return __asyncGenerator(this, arguments, function* getContainers_1() {
            let marker = undefined;
            do {
                const listContainersResponse = yield __await(this.serviceURL.listContainersSegment(storage_blob_1.Aborter.none, marker));
                marker = listContainersResponse.marker;
                for (const container of listContainersResponse.containerItems) {
                    yield new Container(this.serviceURL, container);
                }
            } while (marker);
        });
    }
}
exports.Storage = Storage;
class Container {
    constructor(serviceURL, containerItem) {
        this.serviceURL = serviceURL;
        this.containerURL = storage_blob_1.ContainerURL.fromServiceURL(serviceURL, containerItem.name);
        this.containerItem = containerItem;
        this.name = containerItem.name;
    }
    async getItemsList(dir) {
        const ret = { directories: [], blobs: [] };
        try {
            for (var _a = __asyncValues(this.getItems(dir)), _b; _b = await _a.next(), !_b.done;) {
                const item = await _b.value;
                if (item.type == ItemType.Directory) {
                    const dir = item;
                    ret.directories.push(dir);
                }
                else {
                    const blob = item;
                    ret.blobs.push(blob);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) await _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return ret;
        var e_1, _c;
    }
    getItems(dir) {
        return __asyncGenerator(this, arguments, function* getItems_1() {
            let marker;
            do {
                const listBlobsResponse = yield __await(this.containerURL.listBlobHierarchySegment(storage_blob_1.Aborter.none, exports.delimiter, marker, dir ? { prefix: dir.path + exports.delimiter } : undefined));
                marker = listBlobsResponse.marker;
                if (listBlobsResponse.segment.blobPrefixes) {
                    for (const prefix of listBlobsResponse.segment.blobPrefixes) {
                        yield new Directory(this, prefix.name);
                    }
                }
                for (const blob of listBlobsResponse.segment.blobItems) {
                    yield new Blob(this, blob);
                }
            } while (marker);
        });
    }
    getBlobURL(blob) {
        return storage_blob_1.BlobURL.fromContainerURL(this.containerURL, blob.path);
    }
}
exports.Container = Container;
var ItemType;
(function (ItemType) {
    ItemType["Blob"] = "Blob";
    ItemType["Directory"] = "Directory";
})(ItemType = exports.ItemType || (exports.ItemType = {}));
class Blob {
    constructor(container, blobItem) {
        this.type = ItemType.Blob;
        this.asBlob = this;
        this.container = container;
        this.blobItem = blobItem;
        this.path = blobItem.name;
        this.blobURL = this.container.getBlobURL(this);
        this.url = this.blobURL.url;
    }
}
exports.Blob = Blob;
class Directory {
    constructor(container, name, parent) {
        this.type = ItemType.Directory;
        this.asDirectory = this;
        this.container = container;
        if (parent) {
            this.path = parent.path + exports.delimiter + name;
        }
        else {
            this.path = name;
        }
    }
    getItems() {
        return __asyncGenerator(this, arguments, function* getItems_2() {
            return this.container.getItems(this);
        });
    }
}
exports.Directory = Directory;
//# sourceMappingURL=azureExplorer.js.map