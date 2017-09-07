import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput
} from 'react-native';
import Location from './location';
import RNGooglePlaces from 'react-native-google-places';
import Polyline from '@mapbox/polyline';
import { GOOGLE_MAPS_KEY } from 'react-native-dotenv';
import MapView from 'react-native-maps';
// import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

export default class LetsDoLunch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: {
        latitude: 47.6067006,
        longitude: -122.33250089999999
      },
      friendLocation: {
        latitude: 47.252876799999996,
        longitude:  -122.4442906
      },
      locationData: [],
      currentMode: 'search',
      midPoint: null,
      region: {},
      category: 'lunch',
      type: 'restaurant',
    };
    this.onRegionChange = this.onRegionChange.bind(this);
  }

  findMiddle(myLoc, theirLoc) {
      let meetLat;
      let meetLon;
      if (myLoc.latitude > 0) {
         meetLat = (myLoc.latitude + theirLoc.latitude) / 2
      } else {
        meetLat = (myLoc.latitude - theirLoc.latitude) / 2
      };
      if (myLoc.longitude > 0) {
        meetLon = (myLoc.longitude + theirLoc.longitude) / 2
      } else {
        meetLon = (myLoc.longitude - theirLoc.longitude) / 2
      }
      var midPoint = {
        latitude: meetLat,
        longitude: meetLon,
      }
      return midPoint;
    }

  pickLocation(person) {
    RNGooglePlaces.openPlacePickerModal().then((place) => {
      if (person === 'user') {
        this.setState({userLocation: place})
      } else {
        this.setState({friendLocation: place})
      }
    // place represents user's selection from the
    // suggestions and it is a simplified Google Place object.
    })
    .catch(error => console.log(error.message));  // error is a Javascript Error object
  }

  async getMidPoint(startLoc, destinationLoc) {
    try {
        console.log(startLoc, destinationLoc);
        console.log(1);
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&key=${ GOOGLE_MAPS_KEY }`);
        console.log(2);
        let respJson = await resp.json();
        console.log(respJson);
        console.log(3);
        let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
        console.log(4);
        let coords = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
        });
        console.log(5);
        console.log('coords', coords);
        console.log('length', Math.floor(coords.length / 2))
        let midLocation = coords[Math.floor(coords.length / 2)];
        return midLocation;
    } catch(error) {
        return error
    }
  }

    async findLocations(startLoc, destinationLoc) {
      try {
        console.log('SUP');
        let midLocation = await this.getMidPoint(startLoc, destinationLoc);
        console.log(midLocation);
        console.log(6);
        let results = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${ GOOGLE_MAPS_KEY }&location=${ midLocation.latitude },${ midLocation.longitude }&type=restaurant&keyword=${ this.state.category }&rankby=distance`);
        console.log(7);
        let resultsJson = await results.json();
        console.log(8);
        // console.log(resp2Json);
        this.setState({
          locationData: resultsJson.results.slice(0, 5),
          midPoint: midLocation,
          region: {}
        });
        console.log(this.state.locationData);
    } catch(error) {
        return error
    }
  }

  regionContainingPoints(points) {
    var minX, maxX, minY, maxY;

    // init first point
    ((point) => {
      minX = point.geometry.location.lat;
      maxX = point.geometry.location.lat;
      minY = point.geometry.location.lng;
      maxY = point.geometry.location.lng;
    })(points[0]);

    // calculate rect
    points.map((point) => {
      minX = Math.min(minX, point.geometry.location.lat);
      maxX = Math.max(maxX, point.geometry.location.lat);
      minY = Math.min(minY, point.geometry.location.lng);
      maxY = Math.max(maxY, point.geometry.location.lng);
    });

    var midX = (minX + maxX) / 2;
    var midY = (minY + maxY) / 2;
    var midPoint = [midX, midY];

    var deltaX = (maxX - minX) * 1.5;
    var deltaY = (maxY - minY) * 1.5;

    return {
      latitude: midX, longitude: midY,
      latitudeDelta: deltaX, longitudeDelta: deltaY,
    };
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  
  render() {
    let locations;
    let display;
    let midPointButton;
    let map;
    if (this.state.midPoint) {
      console.log('map reached')
      locations = <Location name={this.state.locationData[0].name} />;
      let region = this.regionContainingPoints(this.state.locationData);
      map = <View style = {styles.container}>
        <MapView
          style           = {styles.map}
          region          = {region}
          onRegionChange  = {this.onRegionChange}
        >
          {this.state.locationData.map(marker => (
            <MapView.Marker
              coordinate={{
                latitude: marker.geometry.location.lat,
                longitude: marker.geometry.location.lng
              }}
              title={marker.name}
              description={marker.vicinity}
              key={marker.id}
            />
          ))}
        </MapView>
      </View>
    }
    if (this.state.userLocation.latitude && this.state.friendLocation.latitude) {
      midPointButton = <Button title="Find midpoint" onPress={() => this.findLocations(this.state.userLocation.latitude.toString() + ", " + this.state.userLocation.longitude.toString(), this.state.friendLocation.latitude.toString() + ", " + this.state.friendLocation.longitude.toString())} />
      }
      if (this.state.currentMode === 'search') {
        display = <View style={{flex: 2, backgroundColor: 'skyblue'}}>
          <Button title="Pick your location" onPress={() => this.pickLocation('user')} />
          <Button color="blue" title="Pick your friend's location" onPress={() => this.pickLocation('friend')} />
          <TextInput
          style={{height: 40}}
          placeholder="Mexican, Italian, Burgers, etc"
          onChangeText={(text) => this.setState({category: text})}
          /> 
         
          {/* <RadioForm
            radio_props={radio_props}
            initial={0}
            onPress={(value) => {this.setState({type: value})}}
          /> */}
          {midPointButton}
        </View>
    }
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'powderblue'}}>
          <Text style={styles.heading}>
            {"Let's Do Lunch"}
          </Text>
        </View>
        {display}
        <View style={{flex: 3, backgroundColor: 'steelblue'}}>
          <Text>Your location: {this.state.userLocation.name}</Text>
          <Text>Friend location: {this.state.friendLocation.name}</Text>
          <Text>Midpoint: {this.state.midLocation} </Text>
          <Text>map lat: {this.state.region.latitude}</Text>
          <Text>map long: {this.state.region.longitude}</Text>
          <Text>map lat delta: {this.state.region.latitudeDelta}</Text>
          <Text>map long delta: {this.state.region.longitudeDelta}</Text>
          <Text>category: {this.state.category}</Text>
        </View>
        {locations}
        {map}
      </View>
    )
  }
}

// var RadioButtonProject = React.createClass({
//   getInitialState: function() {
//     return {
//       value: 0,
//     }
//   },
//   render: function() {
//     return (
//       <View>
//         <RadioForm
//           radio_props={radio_props}
//           initial={0}
//           onPress={(value) => {this.setState({type:value})}}
//         />
//       </View>
//     );
//   }
// });

// const radio_props = [
//   {label: 'restaurant', value: 0 },
//   {label: 'tavern', value: 1 }
// ];

const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center'
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 250,
    width: 250,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    backgroundColor: 'red',
    fontSize: 30,
  }
});

AppRegistry.registerComponent('LetsDoLunch', () => LetsDoLunch);
