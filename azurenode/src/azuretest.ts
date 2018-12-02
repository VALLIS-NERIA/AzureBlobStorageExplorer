import * as Azure from "@azure/storage-blob";
import {
    SharedKeyCredential,
    TokenCredential,
    AnonymousCredential,
    StorageURL,
    ServiceURL,
    Aborter,
    ContainerURL,
    BlobURL,
    BlockBlobURL
} from "@azure/storage-blob";

import * as AzureBlobExplorer from "./azureExplorer"

export async function main_() {
    // // Enter your storage account name and shared key
    const account = "backupstroage";
    // const accountKey = "gH3avMwxeBmvtfN3W379tpPyeECwH3EfuDQVQNUFWY2iBH6n8JwbEfyc+i/L7gLAwn4yek7EbKZwCIDykVYpkg==";

    // // Use SharedKeyCredential with storage account and account key
    // const sharedKeyCredential = new SharedKeyCredential(account, accountKey);

    // // Use TokenCredential with OAuth token
    // const tokenCredential = new TokenCredential("token");
    // tokenCredential.token = "renewedToken";

    // Use AnonymousCredential when url already includes a SAS signature
    const anonymousCredential = new AnonymousCredential();

    // Use sharedKeyCredential, tokenCredential or tokenCredential to create a pipeline
    const pipeline = StorageURL.newPipeline(anonymousCredential);

    // List containers
    const serviceURL = new ServiceURL(
        // When using AnonymousCredential, following url should include a valid SAS or support public access
        //`https://${account}.blob.core.windows.net`,
        "https://backupstroage.blob.core.windows.net/?sv=2017-11-09&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-11-30T15:54:38Z&st=2018-11-28T07:54:38Z&spr=https&sig=nTCU7YCdrL9RWPlo43jfC%2FIPUmdM4wBL7ZhpWtlrrQ0%3D",
        pipeline
    );

    let marker: any;
    do {
        const listContainersResponse = await serviceURL.listContainersSegment(
            Aborter.none,
            marker
        );

        marker = listContainersResponse.marker;
        for (const container of listContainersResponse.containerItems) {
            console.log(`Container: ${container.name}`);
        }
    } while (marker);

    // Create a container
    //const containerName = `newcontainer${new Date().getTime()}`;
    const containerName = `ero`;
    const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

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
        const listBlobsResponse = await containerURL.listBlobHierarchySegment(
            Aborter.none,
            "/",
            marker,
            { prefix: "Ariel/Video/Pro/" }
        );

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


export async function main() {
    const url =
        "https://backupstroage.blob.core.windows.net/?sv=2017-11-09&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-12-09T15:59:59Z&st=2018-12-01T06:42:27Z&spr=https,http&sig=dpuR5vGLBHRYeclGYzcYb%2F4D5v4nLhjcaflkyNB68DE%3D";

    let storage = new AzureBlobExplorer.Storage(url);
    for await (const container of storage.enumerateContainers()) {
        console.log(`Container: ${container.name}`);
        //const top = await container.getItemsList();
        //for (const dir of top.directories) {
        //    const sub = await dir.getItemsList();
        //    //for
        //}

        for await (const item of container.enumerateItems()) {
            if (item.type === AzureBlobExplorer.ItemType.Directory) {
                const dir = item as AzureBlobExplorer.Directory;
                console.log(`Directory: ${dir.path}`);
                for await (const child of dir.enumerateItems()) {
                    console.log(`Directory: ${child.path}`);
                }
            } else {
                const blob = item as AzureBlobExplorer.Blob;
                console.log(`Blob: ${blob.path}`);
            }
        }
    }
}

main();
// An async method returns a Promise object, which is compatible with then().catch() coding style.