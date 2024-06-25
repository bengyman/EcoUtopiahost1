import { Container, Button, HoverCard } from "@mantine/core"
import { useEffect } from "react"

function TestPage() {
    useEffect(() => {
        document.title = "Test Page - EcoUtopia"
    }, [])
  return (
    <Container size={"xl"}>
      <h1>Test Page</h1>
      <p>This is a test page.</p>
      <Button>Click me</Button>
      <HoverCard shadow="md">
        <HoverCard.Target>
          <Button>Hover me</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <p>Test</p>
        </HoverCard.Dropdown>
      </HoverCard>
    </Container>
  )
}

export default TestPage