import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import axios from 'axios';
import MainCarousel from './components/MainCarousel.jsx';
import ModalCarousel from './components/ModalCarousel.jsx'

class Carousel extends React.Component {
  constructor(props) {
    super(props);
    console.log('gettgin static props', this.props)
    this.state = {
      photos: this.props.carouselPhotos || null,
      showModal: false,
      modalToggleImage: null
    };

    this.modalToggleOn = this.modalToggleOn.bind(this);
    this.modalToggleOff = this.modalToggleOff.bind(this);
  }

  componentDidMount() {
    console.log('component did mount', this.state)

    // if(this.state.photos.length==0){ 
    // let listingNumber = window.location.pathname.slice('/').split('/')[1];
    // // Make call to API with listingNumber
    // fetch(`/carousel/photos/${listingNumber}`)
    //   .then(data => data.json())
    //   .then(data => {
    //     console.log(data);
    //     let photos = [];
    //     for(let i in data){
    //       photos.push(data[i])
    //     }
    //     this.setState({photos});
    //   });
    // }
  }

  modalToggleOn(selectedImageIndex) {
    this.setState({
      showModal: true,
      modalToggleImage: selectedImageIndex
    });
    document.body.classList.add('no-scroll');
  }

  modalToggleOff() {
    this.setState({
      showModal: false
    });
    document.body.classList.remove('no-scroll');
  }

  render() {

    if (this.state.photos === null) return null
    else {
      return (
        <React.Fragment>
          <MainCarousel photos={this.state.photos} map={this.state.map} modalToggleOn={this.modalToggleOn} />
          {this.state.showModal ? <ModalCarousel photos={this.state.photos} map={this.state.map} modalToggleOff={this.modalToggleOff} startImageIndex={this.state.modalToggleImage} /> : null}
          <div id="carousel-body">
            <div className="main-image-area">
              <ul className="main-image-list">
                <li className="main-image-list-item">
                  <img className="main-image" />
                </li>
              </ul>
            </div>
            <div className="carousel-thumb-container">
              <ul className="thumb-list"> </ul>
              <div className="button-container">
                <div className="floor-plan-button">
                  <span clclassNameass="button-text" >Floor Plan</span>
                </div>
                <div className="map-button">
                </div>
              </div>
            </div>
          </div>


        </React.Fragment>
      );
    }
  }
}


if (typeof window !== 'undefined') {
  ReactDOM.hydrate(<Carousel />, document.getElementById('carousel-container'), console.log('hydration triggered A:', JSON.stringify(document.getElementById('carousel-container'))));

}
// export function  hydrateCarousel(){
//   ReactDOM.hydrate(<Carousel/>, document.getElementById('carousel-container'))
//   console.log('hydration triggered B');
// }

export default Carousel;
