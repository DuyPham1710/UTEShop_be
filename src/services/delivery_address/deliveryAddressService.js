import DeliveryAddress from '../../models/delivery_address.js';

const DeliveryAddressService = {
    // Get all delivery addresses for a user
    async getByUser(userId) {
        try {
            const addresses = await DeliveryAddress.find({ buyerId: userId }).sort({ defaultAddress: -1, createdAt: -1 });
            return { success: true, data: addresses };
        } catch (error) {
            console.error('DeliveryAddressService.getByUser error', error);
            return { success: false, message: 'Failed to get addresses' };
        }
    },

    // Create a new address
    async create(userId, payload) {
        try {
            // If this is marked as default, unset other defaults for this user
            if (payload.defaultAddress) {
                await DeliveryAddress.updateMany({ buyerId: userId, defaultAddress: true }, { $set: { defaultAddress: false } });
            }

            const newAddr = new DeliveryAddress({ ...payload, buyerId: userId });
            const saved = await newAddr.save();
            return { success: true, data: saved };
        } catch (error) {
            console.error('DeliveryAddressService.create error', error);
            return { success: false, message: 'Failed to create address' };
        }
    },

    // Update an existing address (only owner should call via controller)
    async update(addressId, userId, payload) {
        try {
            // If setting default, unset others first
            if (payload.defaultAddress) {
                await DeliveryAddress.updateMany({ buyerId: userId, defaultAddress: true }, { $set: { defaultAddress: false } });
            }

            const updated = await DeliveryAddress.findOneAndUpdate(
                { _id: addressId, buyerId: userId },
                { $set: payload },
                { new: true }
            );

            if (!updated) return { success: false, message: 'Address not found' };

            return { success: true, data: updated };
        } catch (error) {
            console.error('DeliveryAddressService.update error', error);
            return { success: false, message: 'Failed to update address' };
        }
    },

    // Set a given address as default for user
    async setDefault(addressId, userId) {
        try {
            await DeliveryAddress.updateMany({ buyerId: userId, defaultAddress: true }, { $set: { defaultAddress: false } });
            const updated = await DeliveryAddress.findOneAndUpdate(
                { _id: addressId, buyerId: userId },
                { $set: { defaultAddress: true } },
                { new: true }
            );

            if (!updated) return { success: false, message: 'Address not found' };

            return { success: true, data: updated };
        } catch (error) {
            console.error('DeliveryAddressService.setDefault error', error);
            return { success: false, message: 'Failed to set default address' };
        }
    },

    // Delete an address
    async delete(addressId, userId) {
        try {
            const removed = await DeliveryAddress.findOneAndDelete({ _id: addressId, buyerId: userId });
            if (!removed) return { success: false, message: 'Address not found' };
            return { success: true, data: removed };
        } catch (error) {
            console.error('DeliveryAddressService.delete error', error);
            return { success: false, message: 'Failed to delete address' };
        }
    }
};

export default DeliveryAddressService;
