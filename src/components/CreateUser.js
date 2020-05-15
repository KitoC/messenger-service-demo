import React, { useState } from "react";
import { Card, Form, Loader, Message } from "semantic-ui-react";

const CreateUser = (props) => {
  const { dispatch } = props;

  const [inputValue, setInputValue] = useState("");

  return (
    <Card>
      <Card.Content header>Please enter your name to start.</Card.Content>
      <Card.Content>
        <Form
          onSubmit={() => {
            const userId = `${Math.random()}`;

            setInputValue("");

            const newUser = { name: inputValue, id: userId };

            dispatch({
              type: "SET_USER",
              payload: newUser,
            });

            localStorage.setItem(
              "currentChatUser",
              JSON.stringify({
                name: inputValue,
                id: userId,
                fromLocal: true,
              })
            );
          }}
        >
          <Form.Input
            name="currentChatUser"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fluid
          />
          <Form.Button fluid>Submit name</Form.Button>
        </Form>
      </Card.Content>
    </Card>
  );
};

export default CreateUser;
