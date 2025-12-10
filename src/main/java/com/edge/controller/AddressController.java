package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Address;
import com.edge.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Component
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<Address> getAllAddresses() {
        return addressService.getAllAddresses();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Address> getAddressById(@PathVariable String id) {
        return addressService.getAddressById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/customer/{customerId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<Address> getAddressesByCustomerId(@PathVariable String customerId) {
        return addressService.getAddressesByCustomerId(customerId);
    }

    @GetMapping(value = "/customer/{customerId}/type/{addressType}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<Address> getAddressesByCustomerIdAndType(
            @PathVariable String customerId,
            @PathVariable String addressType) {
        return addressService.getAddressesByCustomerIdAndType(customerId, addressType);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Address createAddress(@RequestBody Address address) {
        return addressService.createAddress(address);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Address> updateAddress(@PathVariable String id, @RequestBody Address addressDetails) {
        try {
            Address updatedAddress = addressService.updateAddress(id, addressDetails);
            return ResponseEntity.ok(updatedAddress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable String id) {
        try {
            addressService.deleteAddress(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

