package com.devsuperior.dscatalog.resoucers;

import com.devsuperior.dscatalog.dto.ProductDTO;
import com.devsuperior.dscatalog.resources.ProductResource;
import com.devsuperior.dscatalog.services.ProductService;
import com.devsuperior.dscatalog.tests.Factory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductResource.class)
public class ProductResourceTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService service;

    private ProductDTO productDTO;
    private PageImpl<ProductDTO> page;



    @BeforeEach
    void setUp() throws Exception{

        //findall
        productDTO = Factory.createProductDTO();
        page = new PageImpl<>(List.of(productDTO));
        when(service.findAllPaged(any())).thenReturn(page);

    }

    //findall
    @Test
    public void findallShouldReturnPage() throws  Exception {
        ResultActions result =
                mockMvc.perform(get("/products")
                        .accept(MediaType.APPLICATION_JSON));
        result.andExpect(status().isOk());
    }






}
