import * as React from "react";
import { Blob } from "../../azureExplorer";
import * as $ from "jquery";
import "lightgallery";
import "lightgallery/dist/css/lightgallery.min.css";
import "lightgallery/dist/css/lg-transitions.min.css";
//import "lightgallery/dist/js/lightgallery-all";
//import "lg-thumbnail";
//import "../../Lib/justifiedGallery/jquery.justifiedGallery.min.js";
//import "../../Lib/justifiedGallery/justifiedGallery.min.css";
import { PrimaryButton } from "office-ui-fabric-react";


const styles: any = require("./MasonryImageView.module.less");

export interface IImageViewProps {
    className?: string;
    blobs: Blob[];
}

export class ButtonSlideImageView extends React.Component<IImageViewProps, {}> {
    render() {
        if (this.props.blobs) {
            return this.getButton();
        }
    }

    private getButton(): JSX.Element {
        const imgs = this.props.blobs.map(b => ({ src: b.url, thumb: b.url }));
        const click = () => {
            const $b: any = $(this);
            $b.lightGallery(
                {
                    dynamic: true,
                    dynamicEl: imgs,
                    showThumbByDefault: false
                });
        };
        return (<button className={this.props.className} onClick={click} key="button">Slide Show</button>);
    }

}