import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class MainCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      mainImages: [],
      thumbnailXShift: 0
    };
    // Bind event handlers:
    this.selectNext = this.selectNext.bind(this);
    this.selectPrev = this.selectPrev.bind(this);
    this.selectByClick = this.selectByClick.bind(this);
    this.shiftThumbnails = this.shiftThumbnails.bind(this);
  }

  componentDidMount() {
    // Attach global event listeners
    document.onkeyup = key => {
      if (key.key === 'ArrowLeft') {
        return this.selectPrev();
      }
      if (key.key === 'ArrowRight') {
        return this.selectNext();
      }
    };
  }

  // Establish mainImages in component state when the first photos are passed
  // down as props. Because fetching photos requires an async API request, the
  // component will likely mount and render before a image is available
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.photos.length > 0 && prevState.mainImages.length === 0) {
      return {
        mainImages: [{ key: 0, url: nextProps.photos[0] }]
      };
    }
    return null;
  }

  selectByClick(event) {
    let selection = parseInt(event.target.dataset.thumbId);
    this.updateMain(selection);
  }

  selectNext() {
    let selection =
      this.state.selected === this.props.photos.length - 1
        ? 0
        : this.state.selected + 1;
    this.updateMain(selection);
  }

  selectPrev() {
    let selection =
      this.state.selected === 0
        ? this.props.photos.length - 1
        : this.state.selected - 1;
    this.updateMain(selection);
  }

  updateMain(photoIndex) {
    let newMainImages = this.state.mainImages.slice(-1);
    let prevKey = this.state.mainImages.slice(-1)[0].key;
    let newKey = prevKey + 1;
    newMainImages.unshift({ key: newKey, url: this.props.photos[photoIndex] });

    this.shiftThumbnails(photoIndex);

    this.setState({
      selected: photoIndex,
      mainImages: newMainImages
    });
  }

  shiftThumbnails(photoIndex) {
    // Thumbnail width in pixels
    const THUMBNAIL_WIDTH = 63;

    // thumbnailXShift is calculated so that the currently selected and next
    // thumbnails are always visible
    let thumbnailXShift = this.state.thumbnailXShift;
    if (3 < photoIndex && photoIndex < this.props.photos.length - 2) {
      thumbnailXShift = -1 * (photoIndex - 3) * THUMBNAIL_WIDTH;
    } else if (photoIndex < 3) {
      thumbnailXShift = 0;
    }

    this.setState({
      thumbnailXShift: thumbnailXShift
    });
  }

  render() {
    return (
      <div id="carousel-body">
        <div className="main-image-area">
          <ul className="main-image-list" onClick={() => {this.props.modalToggleOn(this.state.selected)}}>
            <ReactCSSTransitionGroup
              component={React.Fragment}
              transitionName="crossfade"
              transitionEnterTimeout={300}
              transitionLeaveTimeout={500}
            >
              {this.state.mainImages.reverse().map((e, i) => {
                i++;
                return (
                  <li key={i.toString()} className="main-image-list-item">
                    <img src={e.url} className="main-image" />
                  </li>
                );
              })}
            </ReactCSSTransitionGroup>
          </ul>
        </div>

        <div className="arrow-button main-arrow-left" onClick={this.selectPrev}>
          <div className="arrow-button-pointer-left" />
        </div>
        <div
          className="arrow-button main-arrow-right"
          onClick={this.selectNext}
        >
          <div className="arrow-button-pointer-right" />
        </div>

        <div className="carousel-thumb-container">
          <ul className="thumb-list" style={{ left: this.state.thumbnailXShift }} >
            {
              this.props.photos.length?
              this.props.photos.slice(0, -2).map((e,i) => {
                i++;
                return (
                  <li className="thumb-item" key={i}>
                    <img className={
                        i === this.state.selected ?
                         'thumb-image thumb-selected'
                          : 'thumb-image'
                      }
                       src={e}
                      onClick={this.selectByClick}
                      data-thumb-id={i.toString()}
                    />
                  </li>
                );
              })
            :   null
          }
          }
          </ul>

          <div className="carousel-counter">
            <p>
              {this.state.selected + 1} of{' '}
              {!!this.props.photos ? this.props.photos.length : '0'}
            </p>
          </div>

          <div className="button-container">
            <div className="floor-plan-button">
              <span
                className="button-text"
                data-thumb-id={this.props.photos.length - 2}
                onClick={this.selectByClick}
              >
                Floor Plan
              </span>
            </div>

            <div className="map-button">
              <img
                src={this.props.map ? this.props.map : null}
                data-thumb-id={this.props.photos.length - 1}
                onClick={this.selectByClick}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainCarousel;
