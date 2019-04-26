import * as React from "react";
import ImageBlob from"./ImageBlob";
import { Blob } from "../../azureExplorer";
import * as $ from "jquery";
import "lightgallery/dist/js/lightgallery";
import "lightgallery/dist/css/lightgallery.min.css";
import "lightgallery/dist/css/lg-transitions.min.css";
//import "lightgallery/dist/js/lightgallery-all";
//import "lg-thumbnail";
//import "../../Lib/justifiedGallery/jquery.justifiedGallery.min.js";
//import "../../Lib/justifiedGallery/justifiedGallery.min.css";
import * as Masonry from "masonry-layout/masonry";
const jQueryBridget = require("jquery-bridget");
import * as ImagesLoaded from "imagesloaded/imagesloaded";
import "../../Lib/grid.css";
import { PrimaryButton } from "office-ui-fabric-react/lib/index";

jQueryBridget("masonry", Masonry, $);
ImagesLoaded.makeJQueryPlugin($);

const styles: any = require("./MasonryImageView.module.less");

export interface IMasonryImageViewProps {
    className?: string;
    imgs: ImageBlob[];
    itemClass?: string;
    buttonClass?: string;
    collapse?: boolean;
}

export interface IMasonryImageViewState {
    collapsed: boolean;
}

export class MasonryImageView extends React.Component<IMasonryImageViewProps, IMasonryImageViewState> {
    div: HTMLDivElement;
    $div: any;

    constructor(props) {
        super(props);
        this.state = { collapsed: !!this.props.collapse };
    }

    componentDidMount() {
        this.tryMasonry();
    }

    componentDidUpdate(prevProps: {readonly [P in "className" | "imgs" | "itemClass" | "buttonClass" | "collapse"]:
        IMasonryImageViewProps[P]},
        prevState: {readonly [P in "collapsed"]: IMasonryImageViewState[P]},
        snapshot?): void {
        this.tryMasonry();
    }

    componentWillUnmount() {
        if (this.$div) {this.$div.lightGallery("destroy");}
    }

    render() {
        if (this.props.imgs) {
            if (this.state.collapsed) {
                return (
                    <div className={this.props.className} ref={el => this.div = el} key="masonry">
                        {this.getMasonry()}
                    </div>);
            }
            else {
                const click = () => this.setState({ collapsed: true });
                return <button className={this.props.buttonClass} onClick={click}>Masonry Show</button>;
            }
        }
    }

    private tryMasonry() {
        if (!this.state.collapsed) return;
        this.$div = $(this.div);
        const grid = this.$div.masonry(
            {
                itemSelector: "." + styles.itemContainer,
            });
        grid.imagesLoaded().progress(() => grid.masonry());
        //this.$div.justifiedGallery({ waitThumbnailsLoad : true });
        this.$div.lightGallery(
            {
                selector: "." + styles.imageItem,
                thumbnail: true,
                animateThumb: false,
                showThumbByDefault: false
            });
    }

    private getMasonry(): JSX.Element[] {
        const list: JSX.Element[] = [];
        const width = this.props.itemClass ? this.props.itemClass : "ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl3 ms-xxl2";

        for (const blob of this.props.imgs) {
            list.push(
                <div className={styles.itemContainer + " " + width} key={blob.url}>
                    <a className={styles.imageItem} href={blob.url}>
                        <img className={styles.innerImage} src={blob.thumb} alt={blob.name}/>
                    </a>
                </div>);
        }

        return list;
    }
}