import { useState } from "react";
import axios from "axios";

const ChatComponent = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    try {
      const res = await axios.post("http://localhost:3000/chat", { message });
      setResponse(res.data.choices[0].message.content);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Failed to get a response");
    }
  };

  return (
    <div>
      <h1>Chat with AI</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <p>Response: {response}</p>
    </div>
  );
};

export default ChatComponent;
