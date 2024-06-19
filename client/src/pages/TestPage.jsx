import { Container } from "@mantine/core"
import { useEffect } from "react"

function TestPage() {
    useEffect(() => {
        document.title = "Test Page - EcoUtopia"
    }, [])
  return (
    <Container size={"xl"}>
      <h1>Test Page</h1>
      <p>This is a test page.</p>
    </Container>
  )
}

export default TestPage