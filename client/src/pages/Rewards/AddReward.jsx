import React, { useState } from 'react';
import { TextInput, Textarea, NumberInput, Image, Button, Group, Select, Container, Title, Box } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddReward = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      reward_name: '',
      reward_description: '',
      reward_points: 0,
      reward_value: 0,
      reward_type: '',
      reward_expiry_date: new Date(),
      reward_image: ''
    },
    validate: {
      reward_name: (value) => value.length > 0 ? null : 'Reward name is required',
      reward_points: (value) => value > 0 ? null : 'Reward points must be greater than 0',
      reward_value: (value) => value > 0 ? null : 'Reward value must be greater than 0',
      reward_type: (value) => value.length > 0 ? null : 'Reward type is required',
      reward_expiry_date: (value) => value ? null : 'Expiry date is required',
    }
  });

  const handleFileChange = (event) => {
    const selectedFile = event.currentTarget.files[0];
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const handleCreateReward = async () => {
    const formData = new FormData();
    formData.append('reward_name', form.values.reward_name);
    formData.append('reward_description', form.values.reward_description);
    formData.append('reward_points', form.values.reward_points);
    formData.append('reward_value', form.values.reward_value);
    formData.append('reward_type', form.values.reward_type);
    formData.append('reward_expiry_date', form.values.reward_expiry_date.toISOString().split('T')[0]);
    if (file) {
      formData.append('reward_image', file);
    }

    try {
      await axios.post('/reward', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/rewards');
    } catch (error) {
      console.error('Error creating reward:', error.response.data);
    }
  };

  return (
    <Container size="sm" my="5%">
      <Title align="center" mb="2rem">Add Reward</Title>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateReward();
          }}
          style={{ width: '100%' }}
        >
          <TextInput 
            label="Reward Name" 
            {...form.getInputProps('reward_name')} 
            style={{ marginBottom: '1.5rem', width: '100%' }} 
          />
          <Textarea 
            label="Reward Description" 
            {...form.getInputProps('reward_description')} 
            style={{ marginBottom: '1.5rem', width: '100%' }} 
          />
          <NumberInput 
            label="Reward Points" 
            {...form.getInputProps('reward_points')} 
            style={{ marginBottom: '1.5rem', width: '100%' }} 
          />
          <NumberInput 
            label="Reward Value" 
            {...form.getInputProps('reward_value')} 
            style={{ marginBottom: '1.5rem', width: '100%' }} 
          />
          <Select
            label="Reward Type"
            data={['Discount_Voucher', 'Cash_Voucher', 'Others']}
            {...form.getInputProps('reward_type')}
            style={{ marginBottom: '1.5rem', width: '100%' }}
          />
          <DateInput 
            label="Expiry Date" 
            {...form.getInputProps('reward_expiry_date')} 
            style={{ marginBottom: '1.5rem', width: '100%' }} 
          />
          <TextInput 
            label="Reward Image" 
            type="file" 
            onChange={handleFileChange} 
            style={{ marginBottom: '1rem', width: '100%' }} 
          />
          {filePreview && (
            <Image
              src={filePreview}
              alt="Selected file"
              style={{
                width: '80%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                margin: '0 auto',
              }}
            />
          )}
          <Group position="apart" mt="2rem" grow>
            <Button onClick={() => navigate('/rewards')} style={{ flexGrow: 1 }}>Cancel</Button>
            <Button type="submit" style={{ flexGrow: 1 }}>Create Reward</Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
};

export default AddReward;
