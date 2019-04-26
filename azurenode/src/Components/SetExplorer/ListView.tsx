import * as React from "react";
import { Blob, Directory, ItemList, ISet } from "../../azureExplorer";
import { AgGridReact } from "ag-grid-react";
import * as AgGrid from "ag-grid-community";
import { ColDef, ICellRendererParams, ICellRendererComp } from "ag-grid-community";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { PathLink } from "../Misc/PathLink";

export type DisplaySchema = IDisplaySchema | string;

interface IDisplaySchema {
    name: string,
    formatter?: (any) => string,
}

interface IListViewProp {
    className?: string;
    parent: ISet;
    itemList: ItemList;
    itemMetaReady: boolean;
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
            const dir = this.props.data.dir as ISet;
            return <PathLink style={{ minWidth: "100%", display: "inline-block" }} set={dir}>
                       {this.props.value}
                   </PathLink>;
        }
        else if (this.props.data.type === "Blob") {
            const data = this.props.data;
            return <a
                       href={data.blob.url}
                       style={{ minWidth: "100%", display: "inline-block" }}
                       target="_blank"
                       type={data.contentType}>
                       {this.props.value}
                   </a>;
        }
        this.props.api.sizeColumnsToFit();
        this.props.columnApi.autoSizeAllColumns();
    }

    componentDidMount() {
        this.props.api.sizeColumnsToFit();
        this.props.columnApi.autoSizeAllColumns();
    }

    componentDidUpdate() {
        this.props.api.sizeColumnsToFit();
        this.props.columnApi.autoSizeAllColumns();
    }
}

export class ListView extends React.Component<IListViewProp, IListViewState> {
    private apis: { api: AgGrid.GridApi, columnApi: AgGrid.ColumnApi };

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

        if (newProp.parent) {
            data.push({ type: "Dir", name: "..", dir: newProp.parent })
        }

        for (const dir of newProp.itemList.directories) {
            data.push({ type: "Dir", name: dir.name, dir: dir });
        }

        for (const blob of newProp.itemList.blobs) {
            const entry: { [key: string]: Object } = {};
            entry.type = "Blob";
            // TODO: show blob name instead of path
            entry.name = blob.name;
            entry.blob = blob;
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
        const defs = this.state.columnDefs.map((d) => d.headerName);
        return (
            <div className={`ag-theme-balham ${this.props.className}`}>
                <AgGridReact
                    domLayout="autoHeight"
                    enableSorting={true}
                    enableFilter={true}
                    enableColResize={true}
                    onGridReady={(params) => { this.apis = params }}
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.data}>
                </AgGridReact>
            </div>);
    }

    componentDidMount() {
        if (this.apis) {
            this.apis.api.sizeColumnsToFit();
            this.apis.columnApi.autoSizeAllColumns();
        }
    }

    componentDidUpdate() {
        if (this.apis) {
            this.apis.api.sizeColumnsToFit();
            this.apis.columnApi.autoSizeAllColumns();
        }
    }
}