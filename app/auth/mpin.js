import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, SafeAreaView, Keyboard,} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function MPINScreen() {
  const router = useRouter();
  const [mpin, setMpin] = useState(['', '', '', '']);
  const inputs = useRef([]);

  const handleInput = (value, index) => {
    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);

    // Go to next box if not last and value is entered
    if (value !== '' && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }

    // If all filled, dismiss keyboard or move next
    const allFilled = newMpin.every((d) => d !== '');
    if (allFilled) {
      Keyboard.dismiss();
      // router.push('/nextPage'); // Optional: Auto-nav
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && mpin[index] === '' && index > 0) {
      inputs.current[index - 1].focus();
      const newMpin = [...mpin];
      newMpin[index - 1] = '';
      setMpin(newMpin);
    }
  };

  const clearMpin = () => {
    setMpin(['', '', '', '']);
    inputs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progress}>
        <View style={styles.complete} />
        <View style={styles.complete} />
        <View style={styles.active} />
      </View>

      {/* Title */}
      <Text style={styles.heading}>Create your MPIN</Text>
      <Text style={styles.subtext}>
        Create your MPIN. Enter a 4-digit{'\n'}MPIN below.
      </Text>

      {/* MPIN Label + Clear */}
      <View style={styles.row}>
        <Text style={styles.inputLabel}>Set your MPIN</Text>
        <TouchableOpacity onPress={clearMpin}>
          <Text style={styles.clear}>clear</Text>
        </TouchableOpacity>
      </View>

      {/* MPIN Boxes */}
      <View style={styles.mpinRow}>
        {mpin.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputs.current[i] = ref)}
            style={[styles.mpinBox, i === mpin.length - 1 && { marginRight: 0 }]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(val) => handleInput(val, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
          />
        ))}
      </View>

      <Text style={styles.helperText}>
        You will use this 4 digit MPIN to login next time.
      </Text>

      {/* Spacer + Next button */}
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={styles.nextBtn} onPress={() =>
  router.push({
    pathname: '/auth/reenter-mpin',
    params: { mpin: mpin.join('') }
  })
}
>
        <Text style={styles.nextText}>next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFBFC',
      padding: 24,
      paddingTop: 50,
    },
    progress: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 32,
    },
    complete: {
      width: 40,
      height: 6,
      backgroundColor: '#2DC4A4',
      borderRadius: 3,
      marginHorizontal: 6,
    },
    active: {
      width: 40,
      height: 6,
      backgroundColor: '#FE712D',
      borderRadius: 3,
      marginHorizontal: 6,
    },
    heading: {
        fontSize: 30, // ⬆️ bigger title
        fontWeight: 'bold',
        color: '#3E4A5A',
        marginBottom: 8,
      },
    subtext: {
      fontSize: 14,
      color: '#5B6B7F',
      marginBottom: 60,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    inputLabel: {
      fontWeight: 'bold',
      color: '#3E4A5A',
    },
    clear: {
      color: '#FE712D',
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
    mpinRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    mpinBox: {
        width: 70,             // ⬆️ bigger width
        height: 70,            // ⬆️ bigger height
        backgroundColor: '#fff',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 24,          // ⬆️ larger text
        color: '#3E4A5A',
        borderWidth: 1,
        borderColor: '#D0D7DF',
        marginRight: 10,       // ⬇️ reduce spacing between boxes
      },
      
    helperText: {
      fontSize: 12,
      color: '#5B6B7F',
    },
    nextBtn: {
      backgroundColor: '#FE712D',
      borderRadius: 6,
      paddingVertical: 14,
      alignItems: 'center',
    },
    nextText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      textTransform: 'uppercase',
    },
  });
  