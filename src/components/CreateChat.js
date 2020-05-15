import React, { useState } from "react";
import { Card, Form } from "semantic-ui-react";
import { api } from "../api";

const regionOptions = [1, 2, 3, 4].map((id) => ({
  key: `region:${id}`,
  value: `region:${id}`,
  text: `Region ${id}`,
}));

const zones = [
  { text: "Rose Bay", value: "zone:1", key: 1 },
  { text: "Cab-SOP 2", value: "zone:2", key: 2 },
  { text: "Lid-New 2", value: "zone:3", key: 3 },
  { text: "Concord 2", value: "zone:4", key: 4 },
  { text: "Concord 3", value: "zone:5", key: 5 },
];

const CreateChat = ({ dispatch, currentUser }) => {
  const [selectedRegion, setSelectedRegion] = useState(regionOptions[1].value);
  const handleRegionChange = (e, { value }) => setSelectedRegion(value);

  const [selectedZone, setSelectedZone] = useState(zones[1].value);
  const handleZoneChange = (e, { value }) => setSelectedZone(value);

  return (
    <Card.Content style={{ padding: "1rem" }}>
      <Form
        onSubmit={(...args) => {
          console.log(selectedRegion);
          const newChat = {
            type: "issue",
            authorName: currentUser.name,
            assignnee: "operator:bridj",
            status: "issue_created",
            messages: [],
            // title: "Issue ",
            metadata: {},
            channels: [selectedRegion, selectedZone],
            participants: [{ participantId: "operator:bridj" }],
          };

          dispatch({ type: "SET_CHAT", payload: newChat });
          dispatch({ type: "UPDATE_MESSAGES", payload: [] });
        }}
      >
        <Form.Select
          label="Select Region"
          fluid
          search
          selection
          value={selectedRegion}
          options={regionOptions}
          onChange={handleRegionChange}
        />
        <Form.Select
          label="Select Zone"
          fluid
          search
          selection
          value={selectedZone}
          options={zones}
          onChange={handleZoneChange}
        />
        <Form.Button fluid>Create new issue</Form.Button>
      </Form>
    </Card.Content>
  );
};

export default CreateChat;
