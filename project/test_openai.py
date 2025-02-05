import openai
import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

# Load API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("Missing OpenAI API key! Set OPENAI_API_KEY in your environment.")

client = openai.OpenAI(api_key=api_key)  # Corrected client initialization


def chat_with_gpt(prompt):
    try:
        response = client.chat.completions.create(  # Corrected API call
            model="gpt-3.5-turbo",  
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content  # Corrected response parsing
    except openai.RateLimitError:  # Corrected error handling
        print("Rate limit exceeded. Please check your quota or add billing details.")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


# Test the function
prompt = "Hello!"
response = chat_with_gpt(prompt)
if response:
    print(response)
else:
    print("Failed to get a response from the API.")
