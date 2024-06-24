import { useDisclosure } from '@mantine/hooks';
import { Button, Container, Group, Anchor, Modal, Text } from "@mantine/core"

function App() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Container size={"xl"}>
      <Modal opened={opened} onClose={close} title="Welcome to EcoUtopia">
        <p>This is a modal window. You can use it to display some important information to the user.</p>
        <Group>
          <Button color='blue' onClick={close}>Close</Button>
        </Group>
      </Modal>
      <Text fw={700} size='xl' style={{ marginTop: 20 }}>EcoUtopia Home Page</Text>
      <p>Welcome to EcoUtopia home page. This page is under construction. There are buttons below for navigation.</p>
      <Group>
        <Anchor href="/test">
          <Button color='deepBlue'>Click me</Button>
        </Anchor>
        <Anchor href="/courses">
          <Button color='red'>Click me</Button>
        </Anchor>
        <Button onClick={open} color='green'>Click me</Button>
      </Group>
    </Container>
  )
}

export default App
