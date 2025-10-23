import DeliveryAddressService from '../services/delivery_address/deliveryAddressService.js';

export const getDeliveryAddresses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await DeliveryAddressService.getByUser(userId);
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getDeliveryAddresses controller:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const createDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const payload = req.body;
        const result = await DeliveryAddressService.create(userId, payload);
        if (!result.success) return res.status(400).json(result);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error in createDeliveryAddress controller:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.id;
        const payload = req.body;
        const result = await DeliveryAddressService.update(addressId, userId, payload);
        if (!result.success) return res.status(404).json(result);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateDeliveryAddress controller:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const setDefaultDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.id;
        const result = await DeliveryAddressService.setDefault(addressId, userId);
        if (!result.success) return res.status(404).json(result);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in setDefaultDeliveryAddress controller:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const deleteDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.id;
        const result = await DeliveryAddressService.delete(addressId, userId);
        if (!result.success) return res.status(404).json(result);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in deleteDeliveryAddress controller:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
