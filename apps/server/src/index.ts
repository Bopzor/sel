import express from 'express';

express().listen(process.env.PORT, () => {
  console.log('server started');
});
