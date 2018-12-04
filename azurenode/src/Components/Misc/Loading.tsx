import * as React from "react";

const styles: any = require("./SmallComponents.module.less");

export class Loading extends React.Component {
    render(): JSX.Element {
        return <div className={styles.loading}>Loading...</div>;
    }
}