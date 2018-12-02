"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_blob_1 = require("@azure/storage-blob");
const AzureBlobExplorer = require("./azureExplorer");
async function main_() {
    // // Enter your storage account name and shared key
    const account = "backupstroage";
    // const accountKey = "gH3avMwxeBmvtfN3W379tpPyeECwH3EfuDQVQNUFWY2iBH6n8JwbEfyc+i/L7gLAwn4yek7EbKZwCIDykVYpkg==";
    // // Use SharedKeyCredential with storage account and account key
    // const sharedKeyCredential = new SharedKeyCredential(account, accountKey);
    // // Use TokenCredential with OAuth token
    // const tokenCredential = new TokenCredential("token");
    // tokenCredential.token = "renewedToken";
    // Use AnonymousCredential when url already includes a SAS signature
    const anonymousCredential = new storage_blob_1.AnonymousCredential();
    // Use sharedKeyCredential, tokenCredential or tokenCredential to create a pipeline
    const pipeline = storage_blob_1.StorageURL.newPipeline(anonymousCredential);
    // List containers
    const serviceURL = new storage_blob_1.ServiceURL(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    //`https://${account}.blob.core.windows.net`,
    "https://backupstroage.blob.core.windows.net/?sv=2017-11-09&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-11-30T15:54:38Z&st=2018-11-28T07:54:38Z&spr=https&sig=nTCU7YCdrL9RWPlo43jfC%2FIPUmdM4wBL7ZhpWtlrrQ0%3D", pipeline);
    let marker;
    do {
        const listContainersResponse = await serviceURL.listContainersSegment(storage_blob_1.Aborter.none, marker);
        marker = listContainersResponse.marker;
        for (const container of listContainersResponse.containerItems) {
            console.log(`Container: ${container.name}`);
        }
    } while (marker);
    // Create a container
    //const containerName = `newcontainer${new Date().getTime()}`;
    const containerName = `ero`;
    const containerURL = storage_blob_1.ContainerURL.fromServiceURL(serviceURL, containerName);
    // const createContainerResponse = await containerURL.create(Aborter.none);
    // console.log(
    //     `Create container ${containerName} successfully`,
    //     createContainerResponse.requestId
    // );
    // Create a blob
    // const content = "hello";
    // const blobName = "newblob" + new Date().getTime();
    // const blobURL = BlobURL.fromContainerURL(containerURL, blobName);
    // const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);
    // const uploadBlobResponse = await blockBlobURL.upload(
    //     Aborter.none,
    //     content,
    //     content.length
    // );
    // console.log(
    //     `Upload block blob ${blobName} successfully`,
    //     uploadBlobResponse.requestId
    // );
    // List blobs
    do {
        const listBlobsResponse = await containerURL.listBlobHierarchySegment(storage_blob_1.Aborter.none, "/", marker, { prefix: "Ariel/Video/Pro/" });
        marker = listBlobsResponse.marker;
        for (const blob of listBlobsResponse.segment.blobItems) {
            console.log(`Blob: ${blob.name}`);
        }
    } while (marker);
    // // Get blob content from position 0 to the end
    // // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    // // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
    // const downloadBlockBlobResponse = await blobURL.download(Aborter.none, 0);
    // console.log(
    //     "Downloaded blob content"
    //     //downloadBlockBlobResponse.readableStreamBody.read(content.length).toString()
    // );
    // Delete container
    // await containerURL.delete(Aborter.none);
    // console.log("deleted container");
}
exports.main_ = main_;
async function main() {
    var e_1, _a, e_2, _b, e_3, _c;
    const url = "https://backupstroage.blob.core.windows.net/?sv=2017-11-09&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-12-09T15:59:59Z&st=2018-12-01T06:42:27Z&spr=https,http&sig=dpuR5vGLBHRYeclGYzcYb%2F4D5v4nLhjcaflkyNB68DE%3D";
    let storage = new AzureBlobExplorer.Storage(url);
    try {
        for (var _d = __asyncValues(storage.enumerateContainers()), _e; _e = await _d.next(), !_e.done;) {
            const container = _e.value;
            console.log(`Container: ${container.name}`);
            try {
                //const top = await container.getItemsList();
                //for (const dir of top.directories) {
                //    const sub = await dir.getItemsList();
                //    //for
                //}
                for (var _f = __asyncValues(container.enumerateItems()), _g; _g = await _f.next(), !_g.done;) {
                    const item = _g.value;
                    if (item.type === AzureBlobExplorer.ItemType.Directory) {
                        const dir = item;
                        console.log(`Directory: ${dir.path}`);
                        try {
                            for (var _h = __asyncValues(dir.enumerateItems()), _j; _j = await _h.next(), !_j.done;) {
                                const child = _j.value;
                                console.log(`Directory: ${child.path}`);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_c = _h.return)) await _c.call(_h);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                    else {
                        const blob = item;
                        console.log(`Blob: ${blob.path}`);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) await _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) await _a.call(_d);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.main = main;
main();
// An async method returns a Promise object, which is compatible with then().catch() coding style.
//# sourceMappingURL=azuretest.js.map