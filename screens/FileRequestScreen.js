import React, { useState } from 'react'
import { View, TextInput, Button, Alert, Text } from 'react-native'
import { fileRequest } from '../services/caseService'

export default function FileRequestScreen() {
  const [form, setForm] = useState({
    client_name: '',
    request_type: '',
    request_desc: '',
    occasion: ''
  })

  const submitRequest = async () => {
    try {
      await fileRequest(form)
      Alert.alert('Request submitted!')
      setForm({ client_name: '', request_type: '', request_desc: '', occasion: '' })
    } catch (error) {
      Alert.alert('Error', error.message)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Client Name</Text>
      <TextInput value={form.client_name} onChangeText={v => setForm({ ...form, client_name: v })} />

      <Text>Request Type</Text>
      <TextInput value={form.request_type} onChangeText={v => setForm({ ...form, request_type: v })} />

      <Text>Occasion</Text>
      <TextInput value={form.occasion} onChangeText={v => setForm({ ...form, occasion: v })} />

      <Text>Description</Text>
      <TextInput multiline value={form.request_desc} onChangeText={v => setForm({ ...form, request_desc: v })} />

      <Button title="Submit Request" onPress={submitRequest} />
    </View>
  )
}
