package com.devsuperior.dscatalog.services;

import com.devsuperior.dscatalog.dto.ProductDTO;
import com.devsuperior.dscatalog.entities.Category;
import com.devsuperior.dscatalog.entities.Product;
import com.devsuperior.dscatalog.repositories.CategoryRepository;
import com.devsuperior.dscatalog.repositories.ProductRepository;

import com.devsuperior.dscatalog.services.exceptions.DatabaseException;
import com.devsuperior.dscatalog.services.exceptions.ResourceNotFoundException;
import com.devsuperior.dscatalog.tests.Factory;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Optional;

@ExtendWith(SpringExtension.class)
public class ProductServiceTests {

    @InjectMocks
    private ProductService service;

    @Mock
    private ProductRepository repository;
    @Mock
    private CategoryRepository categoryRepository;

    private long existingId;
    private long nonExistingId;
    private long dependentId;
    private PageImpl<Product> page;
    private Product product;
    private Category category;
    private ProductDTO productDTO;

    @BeforeEach
    void setUp() throws Exception{
        existingId = 1L;
        nonExistingId = 2L;
        dependentId = 3L;
        product = Factory.createProduct();
        category = Factory.createCategory();
        productDTO = Factory.createProductDTO();
        page = new PageImpl<>(List.of(product));

        // simular o findall
        Mockito.when(repository.findAll((Pageable) ArgumentMatchers.any())).thenReturn(page);

        // o save
        Mockito.when(repository.save(ArgumentMatchers.any())).thenReturn(product);

        // findby id
        Mockito.when(repository.findById(existingId)).thenReturn(Optional.of(product));
        Mockito.when(repository.findById(nonExistingId)).thenReturn(Optional.empty());

        //getReferenceById
        Mockito.when(repository.getReferenceById(existingId)).thenReturn(product);
        Mockito.when(repository.getReferenceById(nonExistingId)).thenThrow(EntityNotFoundException.class);

        //getReferenceById category
        Mockito.when(categoryRepository.getReferenceById(existingId)).thenReturn(category);
        Mockito.when(categoryRepository.getReferenceById(nonExistingId)).thenThrow(EntityNotFoundException.class);


        Mockito.when(repository.existsById(existingId)).thenReturn(true);
        Mockito.when(repository.existsById(nonExistingId)).thenReturn(false);
        Mockito.when(repository.existsById(dependentId)).thenReturn(true);

        Mockito.doThrow(DataIntegrityViolationException.class).when(repository).deleteById(dependentId);

    }

    // update retornar um productdto quando o id existir
    @Test
    public void updateShouldReturnProductDTOWhenIdExists(){

        ProductDTO result =  service.uptade(existingId, productDTO);

        Assertions.assertNotNull(result);
    }

    // update retornar  o ResourceNotFoundException quando o id nao existir
    @Test
    public void updateShouldThrowResourceNotFoundExceptionWhenDoesNotExist(){

        Assertions.assertThrows(ResourceNotFoundException.class, () -> {
            service.uptade(nonExistingId, productDTO);
        });

    }

    // findby retornar  o ResourceNotFoundException quando o id nao existir
    @Test
    public void findByIdShouldThrowResourceNotFoundExceptionWhenDoesNotExist(){

        Assertions.assertThrows(ResourceNotFoundException.class, () -> {
            service.findById(nonExistingId);
        });

    }


    // findby retornar  o productdto quando o id existe
    @Test
    public void findByIdShouldReturnProductDTOWhenIdExists(){

      ProductDTO result =  service.findById(existingId);

      Assertions.assertNotNull(result);
    }



    //findAllPaged
    @Test
    public void findAllPagedShouldReturnPage(){

        Pageable pageable = PageRequest.of(0,10);
        Page<ProductDTO> result = service.findAllPaged(pageable);

        // testar se nao é nulo
        Assertions.assertNotNull(result);
        // testando se o findall foi chamando 1 vez
        Mockito.verify(repository).findAll(pageable);

    }

    // delete id dependente de outra unidade
    @Test
    public void deleteShouldThrowDatabaseExceptionDependentId(){
        Assertions.assertThrows(DatabaseException.class, () -> {
            service.delete(dependentId);
        });
    }

    //deletar um id que nao existe
    @Test
    public void deleteShouldThrowResourceNotFoundExceptionWhenIdNotExists(){
        Assertions.assertThrows(ResourceNotFoundException.class, () ->{
            service.delete(nonExistingId);
        });
    }

    // deletar um id que existe
    @Test
    public void deleteShouldDoNothingWheIdExists(){

        Assertions.assertDoesNotThrow(() -> {
            service.delete(existingId);
        });

       // Mockito.verify(repository, Mockito.times(1)).deleteById(existingId);

    }

}
