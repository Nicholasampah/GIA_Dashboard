const express = require('express');
const router = express.Router();
const data = require('../data/deliveries');

// Dashboard - Main page
router.get('/', (req, res) => {
  const { search, status, division, auditor } = req.query;
  let deliveries = data.getAllDeliveries();
  
  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    deliveries = deliveries.filter(delivery => 
      delivery.giaNumber.toLowerCase().includes(searchLower) ||
      delivery.deliveryRef.toLowerCase().includes(searchLower) ||
      delivery.division.toLowerCase().includes(searchLower) ||
      delivery.stockOwner.toLowerCase().includes(searchLower) ||
      delivery.auditorName.toLowerCase().includes(searchLower)
    );
  }
  
  if (status) {
    deliveries = deliveries.filter(d => d.status === status);
  }
  
  if (division) {
    deliveries = deliveries.filter(d => d.division === division);
  }
  
  if (auditor) {
    deliveries = deliveries.filter(d => d.auditorName === auditor);
  }
  
  const stats = data.getStats();
  
  // Get unique values for filters
  const allDeliveries = data.getAllDeliveries();
  const divisions = [...new Set(allDeliveries.map(d => d.division))].sort();
  const auditors = [...new Set(allDeliveries.map(d => d.auditorName).filter(a => a))].sort();
  
  res.render('dashboard', {
    title: 'M2 Finished GIA Dashboard',
    deliveries,
    stats,
    filters: {
      divisions,
      auditors,
      selected: { search, status, division, auditor }
    }
  });
});

// Create new delivery form
router.get('/delivery/new', (req, res) => {
  res.render('delivery-form', {
    title: 'Create New Delivery',
    delivery: {},
    isEdit: false
  });
});

// Edit delivery form
router.get('/delivery/:giaNumber/edit', (req, res) => {
  try {
    console.log('Editing delivery with GIA:', req.params.giaNumber);
    const delivery = data.getDeliveryByGia(req.params.giaNumber);
    
    if (!delivery) {
      console.log('Delivery not found for GIA:', req.params.giaNumber);
      return res.status(404).render('404', {
        title: 'Delivery Not Found',
        message: 'Delivery not found for editing.'
      });
    }
    
    console.log('Found delivery:', delivery);
    res.render('delivery-form', {
      title: `Edit Delivery - ${delivery.giaNumber}`,
      delivery,
      isEdit: true
    });
  } catch (error) {
    console.error('Error in edit route:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the edit form.',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Delivery details page
router.get('/delivery/:giaNumber', (req, res) => {
  const { giaNumber } = req.params;
  const delivery = data.getDeliveryByGia(giaNumber);
  
  if (!delivery) {
    return res.status(404).render('404', {
      title: 'Delivery Not Found',
      message: `Delivery with GIA number ${giaNumber} was not found.`
    });
  }
  
  const discrepancies = data.getDiscrepanciesByGia(giaNumber);
  
  // Calculate discrepancy stats
  const shortages = discrepancies.filter(d => d.type === 'Shortage').length;
  const overages = discrepancies.filter(d => d.type === 'Overage').length;
  const damaged = discrepancies.filter(d => d.type === 'Damaged').length;
  
  res.render('delivery-details', {
    title: `Delivery Details - ${giaNumber}`,
    delivery,
    discrepancies,
    stats: { shortages, overages, damaged }
  });
});



// Handle form submissions
router.post('/delivery', (req, res) => {
  try {
    const newDelivery = data.addDelivery(req.body);
    res.redirect(`/delivery/${newDelivery.giaNumber}?success=created`);
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).render('error', {
      title: 'Error Creating Delivery',
      message: 'Failed to create delivery. Please try again.'
    });
  }
});

router.post('/delivery/:giaNumber/update', (req, res) => {
  try {
    const delivery = data.getDeliveryByGia(req.params.giaNumber);
    
    if (!delivery) {
      return res.status(404).render('404', {
        title: 'Delivery Not Found',
        message: 'Delivery not found for updating.'
      });
    }
    
    const updatedDelivery = data.updateDelivery(delivery.id, req.body);
    
    res.redirect(`/delivery/${updatedDelivery.giaNumber}?success=updated`);
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).render('error', {
      title: 'Error Updating Delivery',
      message: 'Failed to update delivery. Please try again.'
    });
  }
});

module.exports = router;