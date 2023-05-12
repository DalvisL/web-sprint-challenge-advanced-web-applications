// Import the Spinner component into this file and test
// that it renders what it should for the different props it can take.
import React from "react"
import Spinner from "./Spinner"
import { render } from "@testing-library/react"

test('sanity', () => { 
  expect(true).toBe(true)
})

test('Spinner renders correctly', () => {
  const { getByText } = render(<Spinner on={true} />);
  getByText(/please wait.../i);
}
)
