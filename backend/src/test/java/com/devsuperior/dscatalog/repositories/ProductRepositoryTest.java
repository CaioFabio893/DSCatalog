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

    private long existingId;
    private long noExistingId;
    private long countTotalProducts;

    @BeforeEach
    void setUp() throws Exception{
        existingId = 1L;
        noExistingId = 1000L;
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

        repository.deleteById(existingId);

        Optional<Product> result = repository.findById(existingId);

        Assertions.assertFalse(result.isPresent());

    }

    @Test
    public void findByShoulderReturnEmptyOptinalWhenIdExists(){

        Optional<Product> result = repository.findById(existingId);
        Assertions.assertTrue(result.isPresent());

    }


    @Test
    public void findByShoulderReturnEmptyOptinalWhenIdDoesNoExists(){

        Optional<Product> result = repository.findById(noExistingId);
        Assertions.assertTrue(result.isEmpty());

    }


}
