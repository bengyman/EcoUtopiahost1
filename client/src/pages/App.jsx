import { Button, Container, Group, Anchor } from "@mantine/core"

function App() {
  return (
    <Container size={"xl"}>
      <h1>EcoUtopia Home Page</h1>
      <p>Welcome to EcoUtopia home page. This page is under construction. There are buttons below for navigation.</p>
      <Group>
        <Anchor href="/test">
          <Button color='deepBlue'>Click me</Button>
        </Anchor>
        <Anchor href="/courses">
          <Button color='red'>Click me</Button>
        </Anchor>
        <Button color='green'>Click me</Button>
      </Group>
    </Container>
  )
}

export default App
