import React, { useState } from 'react'
import { View, TextInput, Button, Alert, Text } from 'react-native'
import { fileComplaint } from '../services/caseService'

export default function FileComplaintScreen() {
  const [form, setForm] = useState({
    name: '',
    complaint_type: '',
    complaint_description: '',
    emergency: false,
  })

  const submitComplaint = async () => {
    try {
      await fileComplaint(form)
      Alert.alert('Complaint submitted!')
      setForm({ name: '', complaint_type: '', complaint_description: '', emergency: false })
    } catch (error) {
      Alert.alert('Error', error.message)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

      <Text>Complaint Type</Text>
      <TextInput value={form.complaint_type} onChangeText={v => setForm({ ...form, complaint_type: v })} />

      <Text>Description</Text>
      <TextInput multiline value={form.complaint_description} onChangeText={v => setForm({ ...form, complaint_description: v })} />

      <Button title="Submit Complaint" onPress={submitComplaint} />
    </View>
  )
}
