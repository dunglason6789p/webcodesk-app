import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import * as d3 from 'd3';

import './Diagram.css';
import * as manager from './manager';
import DiagramDecorator from './decorators';
import * as context from './context';

const styles = ({
  root: {
    backgroundColor: '#ffffff',
  },
  rootAcceptable: {
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
  }
});

class Diagram extends Component {
  static propTypes = {
    draggedItem: PropTypes.object,
    treeData: PropTypes.object,
    onItemClick: PropTypes.func,
    onDropNew: PropTypes.func,
    onConnectInput: PropTypes.func,
    onErrorClick: PropTypes.func,
    onItemDelete: PropTypes.func,
    onItemDragEnd: PropTypes.func,
    isReadOnly: PropTypes.bool,
  };

  static defaultProps = {
    draggedItem: null,
    treeData: {},
    onItemClick: () => {
      console.info('MyTree.onItemClick is not set.');
    },
    onDropNew: () => {
      console.info('MyTree.onDropNew is not set.');
    },
    onConnectInput: () => {
      console.info('MyTree.onConnectInput is not set');
    },
    onErrorClick: () => {
      console.info('MyTree.onErrorClick is not set');
    },
    onItemDelete: () => {
      console.info('MyTree.onItemDelete is not set');
    },
    onItemDragEnd: () => {
      console.info('MyTree.onItemDragEnd is not set');
    },
    isReadOnly: false,
  };

  constructor (props) {
    super(props);
    this.containerSVG = React.createRef();
    this.rootGroup = React.createRef();
    this.state = {
      isDropItemAcceptable: false,
    };
  }

  componentDidMount() {

    // Init zoom callback function
    this.zoom = d3.zoom()
      .scaleExtent([.3, 1])
      .on("zoom", this.zoomed)
      .on('end', this.zoomEnd);

    // Init svg object
    this.svg = d3.select(this.containerSVG.current);


    // Init container that holds all inner components, it will be transformed on zoom event
    this.container = d3.select(this.rootGroup.current);

    // this.container
    //   .on('keypress', function () {
    //     var tagName = d3.select(d3.event.target).node().tagName;
    //     if (tagName !== 'INPUT' || tagName !== 'SELECT' || tagName !== 'TEXTAREA') {
    //       console.info('Key down: ', d3.event.keyCode);
    //     }
    //   });

    this.svg
      .call(this.zoom)
      .on('dblclick.zoom', this.stopped, true)
      .on('click', this.stopped, true);

      // .on('dragover', () => { d3.event.preventDefault(); })
      // .on('drop', () => {
      //   console.info('Drop on SVG')
      // })
      // .on('dragenter', () => {
      //   if (d3.event.target === this.containerSVG.current) {
      //     console.info('Drag enter SVG: ', d3.event.clientX, d3.event.clientY);
      //   }
      // })
      // .on('dragleave', () => {
      //   if (d3.event.target === this.containerSVG.current) {
      //     console.info('Drag leave SVG');
      //   }
      // });

    this.dragContext = context.initDragLineContext(this.svg, this.container, this.connectInput);
    this.diagramContext = context.initDiagramContext();
    this.diagramDecorator = new DiagramDecorator(this.dragContext, this.diagramContext);

    // this.zoom.scaleTo(this.svg, 0.6);

    const { treeData, draggedItem } = this.props;
    this.updateTree(this.container, treeData, draggedItem, true);
    // window.addEventListener('keydown', this.handleKeyDown);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { isDropItemAcceptable } = this.state;
    const { treeData, isReadOnly, draggedItem } = this.props;
    return treeData !== nextProps.treeData
      || isReadOnly !== nextProps.isReadOnly
      || draggedItem !== nextProps.draggedItem
      || isDropItemAcceptable !== nextState.isDropItemAcceptable;
  }

  componentDidUpdate(prevProps, prevState) {
    const { treeData, draggedItem } = this.props;
    if (treeData !== prevProps.treeData || draggedItem !== prevProps.draggedItem) {
      this.updateTree(this.container, treeData, draggedItem);
    }
  }

  componentWillUnmount () {
    // window.removeEventListener('keydown', this.handleKeyDown);
  }

  updateTree = (rootSelection, flare, draggedItem, focusRoot = false) => {

    this.diagramContext.setDraggedItem(draggedItem);
    this.diagramContext.setHandleItemDblClick(this.focusItem);
    this.diagramContext.setHandleItemClick(this.itemClick);
    this.diagramContext.setHandleDropNew(this.dropNew);
    this.diagramContext.setHandleErrorClick(this.errorClick);
    this.diagramContext.setHandleDragEnd(this.dragEnded);

    const { root, rootNode, rootLink } = manager.createRoots(rootSelection, flare);
    // Enter any new nodes at the parent's previous position.
    const nodeEnter = this.diagramDecorator.decorateNodeEnter(rootNode);
    this.diagramDecorator.decorateNodeUpdate(rootNode, nodeEnter);
    this.diagramDecorator.decorateNodeExit(rootNode);

    // Enter any new links at the parent's previous position.
    const linkEnter = this.diagramDecorator.decorateLinkEnter(rootLink);
    this.diagramDecorator.decorateLinkUpdate(rootLink, linkEnter);
    this.diagramDecorator.decorateLinkExit(rootLink);

    if (focusRoot) {
      this.setInitialPosition(root);
    }

  };

  itemClick = (node) => {
    this.props.onItemClick(node);
  };

  focusItem = (node) => {
    if (node) {
      const {k} = d3.zoomTransform(this.svg.node());
      // let scaleK = k * scaleKoef <= 2 ? scaleKoef : 1;
      let scaleK = k;
      // let newK = k * scaleK;
      let newK = 0.6;
      const {data, x: itemX, y: itemY} = node;
      const selectorNode = this.container.select(`#${data.key}`).node();
      if (selectorNode) {
        const svgBounds = this.svg.node().getBoundingClientRect();

        const itemBoundingClientRect = selectorNode.getBoundingClientRect();
        // Calculate the dimensions when it is scaled already
        const x = (itemY * newK) + ((itemBoundingClientRect.width * scaleK) / 2);
        const y = (itemX * newK) + ((itemBoundingClientRect.height * scaleK) / 2);

        // SVG center x coordinate
        const svgx = svgBounds.width / 2;
        // SVG center y coordinate
        const svgy = svgBounds.height / 2;

        // Because we are using the root component as the starting point in SVG with coordinates 0, 0
        const gLeft = svgx - x;
        const gTop = svgy - y;

        const transform = d3.zoomIdentity
          .translate(gLeft, gTop)
          .scale(newK);

        this.svg
          .transition()
          .duration(500)
          .call(this.zoom.transform, transform);

      } else {
        console.error('Selector node is not found ');
      }
    }
  };

  setInitialPosition = (node) => {
    if (node) {
      const {k} = d3.zoomTransform(this.svg.node());
      // let scaleK = k * scaleKoef <= 2 ? scaleKoef : 1;
      let scaleK = k;
      // let newK = k * scaleK;
      let newK = 0.6;
      const {data, x: itemX, y: itemY} = node;
      const selectorNode = this.container.select(`#${data.key}`).node();
      if (selectorNode) {
        const svgBounds = this.svg.node().getBoundingClientRect();

        const itemBoundingClientRect = selectorNode.getBoundingClientRect();
        // Calculate the dimensions when it is scaled already
        const x = (itemY * newK) + ((itemBoundingClientRect.width * scaleK) / 2);
        // const x = 10;
        const y = (itemX * newK) + ((itemBoundingClientRect.height * scaleK) / 2);
        // const y = 100;

        // SVG center y coordinate
        const svgy = svgBounds.height / 2;

        // Because we are using the root component as the starting point in SVG with coordinates 0, 0
        const gLeft = x;
        const gTop = svgy - y;

        const transform = d3.zoomIdentity
          .translate(gLeft, gTop)
          .scale(newK);

        this.svg
          .transition()
          .duration(500)
          .call(this.zoom.transform, transform);

      } else {
        console.error('Selector node is not found ');
      }
    }
  };

  zoomed = () => {
    // const { k } = d3.event.transform;
    // const { scaleK } = this.state;
    // const newZoomK = Math.floor(k / 0.5);
    // if (scaleK !== newZoomK) {
    //   this.setState({scaleK: newZoomK});
    // }
    this.container.attr("transform", d3.event.transform);
  };

  zoomEnd = () => {
    // console.info('Zooming is finished');
  };

  // If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  stopped = () => {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
  };

  dropNew = (source, destination, position) => {
    this.props.onDropNew(source, destination, position);
  };

  errorClick = (errors) => {
    this.props.onErrorClick(errors);
  };

  connectInput = (outputKey, outputName, inputKey, inputName) => {
    this.props.onConnectInput(outputKey, outputName, inputKey, inputName);
  };

  dragEnded = (key, newPosition) => {
    this.props.onItemDragEnd(key, newPosition);
  };

  handleDragOver = (e) => {
    if (e) {
      e.preventDefault();
    }
  };

  handleDragEnter = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (this.props.draggedItem && e.target === this.containerSVG.current) {
      this.setState({
        isDropItemAcceptable: true,
      });
    }
  };

  handleDragLeave = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (this.props.draggedItem && e.target === this.containerSVG.current) {
      this.setState({
        isDropItemAcceptable: false,
      });
    }
  };

  handleDrop = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (this.props.draggedItem && this.state.isDropItemAcceptable && e.target === this.containerSVG.current) {
      const pt = this.containerSVG.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(this.containerSVG.current.getScreenCTM().inverse());
      const translate = d3.zoomTransform(this.containerSVG.current);
      this.dropNew(this.props.draggedItem, null,
        {
          x: (svgP.y - translate.y)/translate.k,
          y: (svgP.x - translate.x)/translate.k
        }
      );
    }
    this.setState({
      isDropItemAcceptable: false,
    });
  };

  // handleKeyDown = (e) => {
  //   if (e && e.target.tagName) {
  //     if (e.target.tagName !== 'INPUT' || e.target.tagName !== 'SELECT' || e.target.tagName !== 'TEXTAREA') {
  //       if (e.keyCode === 8 || e.keyCode === 46) {
  //         this.props.onItemDelete();
  //       }
  //     }
  //   }
  // };

  render() {
    const { classes } = this.props;
    const { isDropItemAcceptable } = this.state;
    let rootClassName = classes.root;
    if (isDropItemAcceptable) {
      rootClassName = classes.rootAcceptable;
    }
    return (
      <svg
        ref={this.containerSVG}
        className={rootClassName}
        width="100%"
        height="100%"
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
      >
        <g
          ref={this.rootGroup}
        >
        </g>
        <defs>
          <symbol id="icon-notification" viewBox="0 0 32 32">
            <path d="M16 3c-3.472 0-6.737 1.352-9.192 3.808s-3.808 5.72-3.808 9.192c0 3.472 1.352 6.737 3.808 9.192s5.72 3.808 9.192 3.808c3.472 0 6.737-1.352 9.192-3.808s3.808-5.72 3.808-9.192c0-3.472-1.352-6.737-3.808-9.192s-5.72-3.808-9.192-3.808zM16 0v0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-8.837 0-16-7.163-16-16s7.163-16 16-16zM14 22h4v4h-4zM14 6h4v12h-4z" />
          </symbol>
        </defs>
      </svg>
    );
  }
}

export default withStyles(styles)(Diagram);