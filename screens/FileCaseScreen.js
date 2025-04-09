// screens/FileCaseScreen.js
import React, { useState } from 'react'
import { View, TextInput, Button, Alert } from 'react-native'
import { fileCase } from '../services/caseService'

export default function FileCaseScreen() {
  const [form, setForm] = useState({
    name: '',
    department: '',
    equipment: '',
    request_type: '',
    urgency: '',
    reason: '',
    keywords: ''
  })

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    try {
      await fileCase(form)
      Alert.alert('Success', 'Case submitted successfully')
      setForm({
        name: '',
        department: '',
        equipment: '',
        request_type: '',
        urgency: '',
        reason: '',
        keywords: ''
      })
    } catch (error) {
      Alert.alert('Error', error.message)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      {Object.keys(form).map((key) => (
        <TextInput
          key={key}
          placeholder={key}
          value={form[key]}
          onChangeText={(text) => handleChange(key, text)}
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 8
          }}
        />
      ))}
      <Button title="Submit Case" onPress={handleSubmit} />
    </View>
  )
}
