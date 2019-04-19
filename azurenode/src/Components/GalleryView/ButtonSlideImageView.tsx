import * as React from "react";
import ImageBlob from"./ImageBlob";
import * as $ from "jquery";
import "lightgallery/dist/js/lightgallery";
import "lg-thumbnail";
import "lightgallery/dist/css/lightgallery.min.css";
import "lightgallery/dist/css/lg-transitions.min.css";
//import "lightgallery/dist/js/lightgallery-all";
//import "lg-thumbnail";
//import "../../Lib/justifiedGallery/jquery.justifiedGallery.min.js";
//import "../../Lib/justifiedGallery/justifiedGallery.min.css";
//import { PrimaryButton } from "office-ui-fabric-react/lib/index";

export interface IImageViewProps {
    className?: string;
    imgs: ImageBlob[];
}

export class ButtonSlideImageView extends React.Component<IImageViewProps, {}> {
    render() {
        if (this.props.imgs) {
            return this.getButton();
        }
    }

    private getButton(): JSX.Element {
        const imgs = this.props.imgs.map(b => ({ src: b.url, thumb: b.thumb }));
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