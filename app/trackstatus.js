import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

const TrackStatus = () => {
  const [activeTab, setActiveTab] = useState("complaints");
  const [complaints, setComplaints] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: complaintsData } = await supabase.from("complaints").select("*");
    const { data: requestsData } = await supabase.from("requests").select("*");

    setComplaints(complaintsData || []);
    setRequests(requestsData || []);
  };

  const renderCard = (item) => {
    const status = item.status?.toLowerCase() || "pending";
    const statusColors = {
      "to verify": "orange",
      "unsettled": "red",
      "settled": "green",
      "in progress": "blue",
      "pending": "gray",
    };
  
    return (
      <View style={styles.card}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.complaint_name || item.request_title || "No Title"}
        </Text>
        <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
          {item.complaint_desc || item.request_desc || "No description"}
        </Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColors[status] || "gray" },
            ]}
          />
          <Text style={styles.statusText}>Status: {item.status || "Pending"}</Text>
        </View>
      </View>
    );
  };

  const dataToRender = activeTab === "complaints" ? complaints : requests;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "complaints" && styles.activeTab]}
          onPress={() => setActiveTab("complaints")}
        >
          <Text style={styles.tabText}>Complaints</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Text style={styles.tabText}>Requests</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataToRender}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => renderCard(item)}
      />
    </View>
  );
};

export default TrackStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#56DA66",
  },
  tabText: {
    color: "#000",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    height: 120, // Fixed height for consistency
    overflow: "hidden",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: "#444",
    flexShrink: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#666",
  },
});
