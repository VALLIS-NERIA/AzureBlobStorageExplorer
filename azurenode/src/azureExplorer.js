"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_blob_1 = require("@azure/storage-blob");
exports.delimiter = "/";
var ItemType;
(function (ItemType) {
    ItemType["Blob"] = "Blob";
    ItemType["Directory"] = "Directory";
})(ItemType = exports.ItemType || (exports.ItemType = {}));
class ItemList {
    constructor() {
        this.blobTasks = [];
        this.directories = [];
        this.blobs = [];
    }
    [Symbol.iterator]() {
        return this.enumerate();
    }
    add(item) {
        if (item.type === ItemType.Directory) {
            this.directories.push(item.asDirectory);
        }
        else if (item.type === ItemType.Blob) {
            this.blobs.push(item.asBlob);
            this.blobTasks.push(item.asBlob.getting);
        }
        else {
            throw new Error("Unknown item.type");
        }
    }
    waitBlobMetadata() {
        return Promise.all(this.blobTasks).then(() => { });
    }
    *enumerate() {
        for (const dir of this.directories) {
            yield dir;
        }
        for (const blob of this.blobs) {
            yield blob;
        }
    }
}
exports.ItemList = ItemList;
class Storage {
    constructor(sasUrl) {
        this.anonCred = new storage_blob_1.AnonymousCredential();
        this.pipeline = storage_blob_1.StorageURL.newPipeline(this.anonCred);
        this.url = sasUrl;
        this.serviceURL = new storage_blob_1.ServiceURL(this.url, this.pipeline);
    }
    enumerateContainers() {
        return __asyncGenerator(this, arguments, function* enumerateContainers_1() {
            let marker = undefined;
            do {
                const listContainersResponse = yield __await(this.serviceURL.listContainersSegment(storage_blob_1.Aborter.none, marker));
                marker = listContainersResponse.marker;
                for (const container of listContainersResponse.containerItems) {
                    yield yield __await(new Container(this.serviceURL, container));
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
    async getItemsList(prefix) {
        var e_1, _a;
        const ret = new ItemList();
        try {
            for (var _b = __asyncValues(this.enumerateItems(prefix)), _c; _c = await _b.next(), !_c.done;) {
                const item = _c.value;
                ret.add(item);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return ret;
    }
    enumerateItems(prefix) {
        return __asyncGenerator(this, arguments, function* enumerateItems_1() {
            console.log(prefix);
            let marker;
            do {
                const listBlobsResponse = yield __await(this.containerURL.listBlobHierarchySegment(storage_blob_1.Aborter.none, exports.delimiter, marker, prefix ? { prefix: prefix } : undefined));
                marker = listBlobsResponse.marker;
                if (listBlobsResponse.segment.blobPrefixes) {
                    for (const prefix of listBlobsResponse.segment.blobPrefixes) {
                        yield yield __await(new Directory(this, prefix.name));
                    }
                }
                for (const blob of listBlobsResponse.segment.blobItems) {
                    yield yield __await(new Blob(this, blob));
                }
            } while (marker);
        });
    }
    getBlobURL(blob) {
        return storage_blob_1.BlobURL.fromContainerURL(this.containerURL, blob.path);
    }
}
exports.Container = Container;
class Blob {
    constructor(container, blobItem) {
        this.type = ItemType.Blob;
        this.asBlob = this;
        this.container = container;
        this.blobItem = blobItem;
        this.path = blobItem.name;
        this.blobURL = this.container.getBlobURL(this);
        this.url = this.blobURL.url;
        this.properties = null;
        this.getting = this.getMetadata();
    }
    getMetadata() {
        return this.blobURL.getProperties(storage_blob_1.Aborter.timeout(5000))
            .then((response) => {
            this.properties = response;
        });
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
    getItemsList(prefix) {
        return this.container.getItemsList(this.path);
    }
    enumerateItems(prefix) {
        return this.container.enumerateItems(this.path);
    }
}
exports.Directory = Directory;
//# sourceMappingURL=azureExplorer.js.map