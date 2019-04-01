import * as React from "react";

const styles: any = require("./SmallComponents.module.less");

export class Loading extends React.Component<{ message?: string }> {
    render(): JSX.Element {
        return <div className={styles.loading}>{this.props.message ? this.props.message : "Loading..."}</div>;
    }
}