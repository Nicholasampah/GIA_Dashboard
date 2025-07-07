const { v4: uuidv4 } = require('uuid');

let deliveries = [
  {
    id: uuidv4(),
    giaNumber: '4908144',
    deliveryRef: '90-2506030-091',
    deliveryId: '90-2506030-091',
    asnType: 'ASN_DEFAULT',
    supplierName: 'WHO005',
    division: 'Core Beauty',
    stockOwner: 'THEHUT',
    finishedDate: new Date('2025-07-01'),
    inventoryAdmin: 'Nicholas Ampah',
    status: 'Reported',
    auditorName: 'Nicholas Ampah',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: uuidv4(),
    giaNumber: '4202502',
    deliveryRef: '90-250701-002',
    deliveryId: '90-250701-002',
    asnType: 'ASN_STANDARD',
    supplierName: 'ING001',
    division: 'Ingenuity',
    stockOwner: 'HOLLANDBARRET',
    finishedDate: new Date('2025-07-02'),
    inventoryAdmin: 'Sarah Johnson',
    status: 'Not Reported',
    auditorName: '',
    createdAt: new Date('2025-07-02'),
    updatedAt: new Date('2025-07-02')
  },
  {
    id: uuidv4(),
    giaNumber: '4202503',
    deliveryRef: '90-250701-003',
    deliveryId: '90-250701-003',
    asnType: 'ASN_DEFAULT',
    supplierName: 'CUL002',
    division: 'Cult Beauty',
    stockOwner: 'THEHUT',
    finishedDate: new Date('2025-07-02'),
    inventoryAdmin: 'Emily Davis',
    status: 'Reported',
    auditorName: 'Emily Davis',
    createdAt: new Date('2025-07-02'),
    updatedAt: new Date('2025-07-02')
  },
  {
    id: uuidv4(),
    giaNumber: '4202504',
    deliveryRef: '90-250701-006',
    deliveryId: '90-250701-006',
    asnType: 'ASN_BULK',
    supplierName: 'SUB003',
    division: 'Subscriptions',
    stockOwner: 'THEHUT',
    finishedDate: new Date('2025-07-02'),
    inventoryAdmin: 'David Wilson',
    status: 'Not Reported',
    auditorName: '',
    createdAt: new Date('2025-07-02'),
    updatedAt: new Date('2025-07-02')
  },
  {
    id: uuidv4(),
    giaNumber: '4202505',
    deliveryRef: '90-250701-007',
    deliveryId: '90-250701-007',
    asnType: 'ASN_EXPRESS',
    supplierName: 'ALL004',
    division: 'Ingenuity',
    stockOwner: 'ALLBEAUTY',
    finishedDate: new Date('2025-07-02'),
    inventoryAdmin: 'Lisa Anderson',
    status: 'Reported',
    auditorName: 'Lisa Anderson',
    createdAt: new Date('2025-07-02'),
    updatedAt: new Date('2025-07-02')
  },
  {
    id: uuidv4(),
    giaNumber: '4202506',
    deliveryRef: '90-250701-008',
    deliveryId: '90-250701-008',
    asnType: 'ASN_DEFAULT',
    supplierName: 'LUX005',
    division: 'Luxury',
    stockOwner: 'LUX',
    finishedDate: new Date('2025-07-02'),
    inventoryAdmin: 'Mike Chen',
    status: 'Not Reported',
    auditorName: '',
    createdAt: new Date('2025-07-02'),
    updatedAt: new Date('2025-07-02')
  }
];

let discrepancies = [
  {
    id: uuidv4(),
    deliveryId: deliveries[0].id,
    giaNumber: '4908144',
    type: 'Shortage',
    productId: '16807505',
    barcode: '-',
    title: 'WHO IS ELIJAH Electric Soul 5ml',
    expectedQty: '1000 EA',
    receivedGood: '0 EA',
    receivedDamaged: '0 EA',
    difference: '-1000 EA',
    signOffDate: new Date('2025-07-04T10:38:00'),
    comments: 'recounted 04/07',
    status: 'Awaiting Feedback from SC',
    hqRequest: 'Recount',
    hqComment: '-',
    pictures: [],
    createdAt: new Date('2025-07-04'),
    updatedAt: new Date('2025-07-04')
  },
  {
    id: uuidv4(),
    deliveryId: deliveries[0].id,
    giaNumber: '4908144',
    type: 'Overage',
    productId: '14883803',
    barcode: '9357380000795',
    title: 'WHO IS ELIJAH Wall Street Eau de parfum 50ml',
    expectedQty: '38 EA',
    receivedGood: '41 EA',
    receivedDamaged: '0 EA',
    difference: '+3 EA',
    signOffDate: new Date('2025-07-04T10:38:00'),
    comments: 'recounted 04/07',
    status: 'Awaiting Feedback from SC',
    hqRequest: 'Recount',
    hqComment: '-',
    pictures: [],
    createdAt: new Date('2025-07-04'),
    updatedAt: new Date('2025-07-04')
  },
  {
    id: uuidv4(),
    deliveryId: deliveries[1].id,
    giaNumber: '4202502',
    type: 'Shortage',
    productId: '14270403',
    barcode: '9357380000580',
    title: 'WHO IS ELIJAH Morning After Eau de parfum 50ml',
    expectedQty: '27 EA',
    receivedGood: '25 EA',
    receivedDamaged: '0 EA',
    difference: '-2 EA',
    signOffDate: new Date('2025-07-04T10:38:00'),
    comments: 'recounted 04/07',
    status: 'Awaiting Feedback from SC',
    hqRequest: 'Recount',
    hqComment: '-',
    pictures: [],
    createdAt: new Date('2025-07-04'),
    updatedAt: new Date('2025-07-04')
  }
];

module.exports = {
  deliveries,
  discrepancies,
  
  // Helper functions
  getAllDeliveries: () => deliveries,
  
  getDeliveryByGia: (giaNumber) => 
    deliveries.find(d => d.giaNumber === giaNumber),
  
  getDeliveryById: (id) => 
    deliveries.find(d => d.id === id),
  
  addDelivery: (deliveryData) => {
    const newDelivery = {
      id: uuidv4(),
      ...deliveryData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    deliveries.push(newDelivery);
    return newDelivery;
  },
  
  updateDelivery: (id, updateData) => {
    const index = deliveries.findIndex(d => d.id === id);
    if (index !== -1) {
      deliveries[index] = {
        ...deliveries[index],
        ...updateData,
        updatedAt: new Date()
      };
      return deliveries[index];
    }
    return null;
  },
  
  deleteDelivery: (id) => {
    const index = deliveries.findIndex(d => d.id === id);
    if (index !== -1) {
      return deliveries.splice(index, 1)[0];
    }
    return null;
  },
  
  getDiscrepanciesByGia: (giaNumber) => 
    discrepancies.filter(d => d.giaNumber === giaNumber),
  
  addDiscrepancy: (discrepancyData) => {
    const newDiscrepancy = {
      id: uuidv4(),
      ...discrepancyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    discrepancies.push(newDiscrepancy);
    return newDiscrepancy;
  },
  
  updateDiscrepancy: (id, updateData) => {
    const index = discrepancies.findIndex(d => d.id === id);
    if (index !== -1) {
      discrepancies[index] = {
        ...discrepancies[index],
        ...updateData,
        updatedAt: new Date()
      };
      return discrepancies[index];
    }
    return null;
  },
  
  getStats: () => {
    const total = deliveries.length;
    const reported = deliveries.filter(d => d.status === 'Reported').length;
    const pending = total - reported;
    const completionRate = total > 0 ? Math.round((reported / total) * 100) : 0;
    
    return {
      total,
      reported,
      pending,
      completionRate
    };
  }
};