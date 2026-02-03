package com.devsuperior.dscatalog.repositories;

import com.devsuperior.dscatalog.entities.Product;
import com.devsuperior.dscatalog.tests.Factory;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

@DataJpaTest
public class ProductRepositoryTest {

    @Autowired
    private ProductRepository repository;

    private long exintingId;
    private long countTotalProducts;

    @BeforeEach
    void setUp() throws Exception{
        exintingId = 1L;
        countTotalProducts = 25L;
    }



    // testar o save ta inserindo um novo objeto quando o id é nulo
    @Test
    public void saveShouldPersistWithAutoincrementWheIdIsNull(){

        Product product = Factory.createProduct();
        product.setId(null);

        product = repository.save(product);

        Assertions.assertNotNull(product.getId());
        Assertions.assertEquals(countTotalProducts + 1, product.getId());

    }


    // teste do delete
    @Test
    public void deleteShouldDeleteObjectWheIdExists(){

        repository.deleteById(exintingId);

        Optional<Product> result = repository.findById(exintingId);

        Assertions.assertFalse(result.isPresent());

    }
}
