import * as React from "react";
import { Link } from "react-router-dom";
import { Blob, Directory, ItemList } from "../../azureExplorer";
import * as AgGrid from "ag-grid-react";
import { ColDef, ICellRendererParams, ICellRendererComp } from "ag-grid-community";
import "ag-grid-community/dist/styles/ag-grid.css";

export type DisplaySchema = IDisplaySchema | string;

interface IDisplaySchema {
    name: string,
    formatter?: (any) => string,
}

interface IListViewProp {
    className?: string;
    itemList: ItemList;
    dirUrl(dir: Directory): string;
    schemas: DisplaySchema[];
}

interface IListViewState {
    columnDefs: ColDef[];
    data: { [key: string]: Object }[];
}

// create your cellRenderer as a React component
class NameCellRenderer extends React.Component<ICellRendererParams> {
    render() {
        if (this.props.data.type === "Dir") {
            return <Link to={this.props.data.link}> {this.props.value} </Link>;
        }
        else if (this.props.data.type === "Blob") {
            const data = this.props.data;
            return <a href={data.link} target="_blank" type={data.contentType}>
                       {this.props.value}
                   </a>;
        }
    }
}

export class ListView extends React.Component<IListViewProp, IListViewState> {
    constructor(props: IListViewProp) {
        super(props);

        this.state = ListView.getDerivedStateFromProps(props, null);
    }


    static getDerivedStateFromProps(newProp: IListViewProp, prevState: IListViewState): IListViewState {
        const columnDefs: ColDef[] = [];
        const data: { [key: string]: Object }[] = [];

        columnDefs.push({ headerName: "type", field: "type" });
        columnDefs.push({ headerName: "name", field: "name", cellRendererFramework: NameCellRenderer });

        for (const schema of newProp.schemas) {
            const name = typeof schema === "string" ? schema as string : (schema as IDisplaySchema).name;
            columnDefs.push({ headerName: name, field: name });
        }

        for (const dir of newProp.itemList.directories) {
            data.push({ type: "Dir", name: dir.path, link: newProp.dirUrl(dir) });
        }

        for (const blob of newProp.itemList.blobs) {
            const entry: { [key: string]: Object } = {};
            entry.type = "Blob";
            // TODO: show blob name instead of path
            entry.name = blob.path;
            entry.link = blob.url;
            if (blob.properties) {
                for (const prop of newProp.schemas) {
                    if (typeof prop === "string") {
                        entry[prop] = blob.properties[prop];
                    }
                    else {
                        if (prop.formatter) {
                            entry[prop.name] = prop.formatter(blob.properties[prop.name]);
                        }
                        else {
                            entry[prop.name] = blob.properties[prop.name];
                        }
                    }
                }
            }
            data.push(entry);
        }

        return { columnDefs: columnDefs, data: data };
    }

    render() {
        return (
            <div className={this.props.className}>
                <AgGrid.AgGridReact
                    enableSorting={true}
                    enableFilter={true}
                    enableColResize={true}
                    onFirstDataRendered={(params) => {
                        window.addEventListener("resize",
                            function() {
                                setTimeout(function() {
                                    params.api.sizeColumnsToFit();
                                });
                            });
                        params.columnApi.autoSizeColumns(["type", "name"]);
                        params.api.sizeColumnsToFit();
                    }}
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.data}>
                </AgGrid.AgGridReact>
            </div>);
    }
}