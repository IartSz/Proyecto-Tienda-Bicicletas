package com.ridertapia.proveedores;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ProveedoresApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void mainClassNoEsNull() {
        assertNotNull(new ProveedoresApplication());
    }

    @Test
    void restTemplateBeanNoEsNull() {
        assertNotNull(new ProveedoresApplication().restTemplate());
    }
}
