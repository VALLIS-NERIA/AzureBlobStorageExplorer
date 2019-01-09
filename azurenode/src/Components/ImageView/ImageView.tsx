import * as React from "react";

import * as $ from "jquery";
import "lightgallery";
import "lightgallery/dist/css/lightgallery.css";
import "lightgallery/dist/css/lg-transitions.css";
import "lightgallery/dist/js/lightgallery-all";
import "lg-thumbnail";
import "../../Lib/justifiedGallery/jquery.justifiedGallery.min.js";
import "../../LibjustifiedGallery/justifiedGallery.min.css";

export interface IImageViewProps {
    imgs?: string[];
}

export class ImageView extends React.Component<IImageViewProps, {}> {

    public el: HTMLDivElement;
    public $el: any;

    componentDidMount() {
        this.$el = $(this.el);
        this.$el.justifiedGallery();
        this.$el.lightGallery(
            {
                selector: ".imageItem",
                thumbnail: true,
                animateThumb: false,
                showThumbByDefault: false
            });
    }

    componentWillUnmount() {
        this.$el.lightGallery("destroy");
    }

    render() {
        const list: JSX.Element[] = [];
        if (this.props.imgs) {
            for (const img of this.props.imgs) {
                list.push(<a className="imageItem" key={img} href={img}><img src={img} /> </a>);
            }
        }
        return <div ref={el => this.el = el}>
            {list}
        </div>;
    }
}