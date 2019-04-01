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
import * as Masonry from "masonry-layout";
const jQueryBridget = require("jquery-bridget");
import * as ImagesLoaded from "imagesloaded";


jQueryBridget("masonry", Masonry, $);
ImagesLoaded.makeJQueryPlugin($);

const styles: any = require("./ImageView.module.less");

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
        const grid = this.$el.masonry(
            {
                itemSelector: "." + styles.imageItem,
            });
        grid.imagesLoaded().progress(() => grid.masonry());
        //this.$el.justifiedGallery({ waitThumbnailsLoad : true });
        this.$el.lightGallery(
            {
                selector: "." + styles.imageItem,
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
                list.push(
                    <a className={styles.imageItem + " " + styles.fullWidth} key={blob.url} href={blob.url}>
                        <img className={styles.innerImage} src={blob.url} alt={blob.name}/>
                    </a>);
            }
        }
        return (
            <div className={this.props.className} ref={el => this.el = el}>
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className={styles.fullWidth}></div>
                        {list}
                    </div>
                </div>
            </div>);
    }
}