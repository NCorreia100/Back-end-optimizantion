//note: very little touch up was done on the front end by me, just accomodating changes to perform SSR


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
    console.log('ComponentDidMount...\nEvent handler hooks not working because of passing down props prior to SSR')

  //   //Get state props if not present
  //   if(this.state.photos.length==0){ 

  //   //Get listing Id from address bar and escape it
  //   let listingNumber = JSON.stringify(window.location.pathname.slice('/').split('/')[1]);

  //   //Make API request with listing ID as params
  //   fetch(`/carousel/photos/${listingNumber}`)
  //     .then(data => data.json())
  //     .then(data => {
  //       console.log(data);
  //       let photos = [];
  //       for(let i in data){
  //         photos.push(data[i])
  //       }

  //       //Update state with photos
  //       this.setState({photos},()=>console.log(state updated));
  //     });
  //   }
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

    //don't render anything if state hasn't been updated
    if (this.state.photos === null) return null
    else {
      return (
        <React.Fragment>
          <MainCarousel photos={this.state.photos} map={this.state.map} modalToggleOn={this.modalToggleOn} />
          {this.state.showModal ? <ModalCarousel photos={this.state.photos} map={this.state.map} modalToggleOff={this.modalToggleOff} startImageIndex={this.state.modalToggleImage} /> : null}
          
          {/* the following markup was orginally on the html file*/}
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
                  <span className="button-text" >Floor Plan</span>
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

//for SSR Carousel component has to be exported, however Babel's JS transpiler 
//will not see a window global property because it resides on the browser only
//
if (typeof window !== 'undefined') {
  //hydrate places the event handler hooks onto the page, however it doesn't work because it doesn't expect state to contain props
  ReactDOM.hydrate(<Carousel />, document.getElementById('carousel-container'), console.log('hydration triggered A:', JSON.stringify(document.getElementById('carousel-container'))));
}

export default Carousel;
