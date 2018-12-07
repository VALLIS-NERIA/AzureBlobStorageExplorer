import * as React from "react";
import { Blob, BlobProperties } from "../../azureExplorer";
const styles: any = require("./SmallComponents.module.less");


interface IBlobEntry {
    blob: Blob;
    schema: string[];
}

export class BlobEntry extends React.Component<IBlobEntry, {}> {
    render(): JSX.Element {
        const blob = this.props.blob;
        if (!blob) return null;
        const list: JSX.Element[] = [];
        if (blob.properties) {
            for (const ext of this.props.schema) {
                const res = this.props.blob.properties[ext];
                if (res) {
                    list.push(<td key={ext.toString()}>{res.toString()}</td>);
                }
            }
        }
        return (
            <tr>
                <td>Blob</td>
                <td>
                    <a href={blob.url} target="_blank" type={blob.properties ? blob.properties.contentType : null}>
                        {`${blob.path}`}
                    </a>
                </td>
                {list}
            </tr>);
    }
}