/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class LetsDoLunch extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'powderblue'}}>
          <Text style={styles.text}>
            {"Let's Do Lunch"}
          </Text>
        </View>
        <View style={{flex: 2, backgroundColor: 'skyblue'}} />
        <View style={{flex: 3, backgroundColor: 'steelblue'}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 50,
    color: 'black',
    textAlign: 'center'
  },
});

AppRegistry.registerComponent('LetsDoLunch', () => LetsDoLunch);
