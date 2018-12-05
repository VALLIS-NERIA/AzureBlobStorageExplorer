import * as React from "react";
import { Blob } from "../../azureExplorer";
const styles: any = require("./SmallComponents.module.less");

type Extracter = (blob: Blob) => string;

interface IBlobEntry {
    blob: Blob;
    schema: Extracter[]; 
}

export class BlobEntry extends React.Component<IBlobEntry, {}> {
    render(): JSX.Element {
        const blob = this.props.blob;
        if (!blob) return null;

        return (
            <tr>
                <td>Blob</td>
                <td><a href={blob.url} target="_blank" type={blob.properties.contentType}> {`${blob.path}`} </a></td>
                <td>{blob.properties.</td>
            </tr>);
    }
}}