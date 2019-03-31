import * as React from "react";
import { Blob } from "../../azureExplorer";
import * as $ from "jquery";
import "lightgallery";
import "lightgallery/dist/css/lightgallery.css";
import "lightgallery/dist/css/lg-transitions.css";
import "lightgallery/dist/js/lightgallery-all";
import "lg-thumbnail";
import "../../Lib/justifiedGallery/jquery.justifiedGallery.min.js";
import "../../Lib/justifiedGallery/justifiedGallery.min.css";

export interface IImageViewProps {
    className?: string;
    blobs?: Blob[];
    loadFinished: boolean;
}

export class ImageView extends React.Component<IImageViewProps, {}> {

    public el: HTMLDivElement;
    public $el: any;

    componentDidMount() {
        this.$el = $(this.el);
        this.$el.justifiedGallery({ waitThumbnailsLoad : false });
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
        if (this.props.blobs) {
            for (const blob of this.props.blobs) {
                list.push(<a className="imageItem" key={blob.url} href={blob.url}>
                    <img src={blob.url} alt={blob.name} height={200} width={200}/>
                          </a>);
            }
        }
        return <div className={this.props.className} ref={el => this.el = el}>
                   {list}
               </div>;
    }
}