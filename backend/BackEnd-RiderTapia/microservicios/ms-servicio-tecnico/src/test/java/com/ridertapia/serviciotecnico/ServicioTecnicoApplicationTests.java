package com.ridertapia.serviciotecnico;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ServicioTecnicoApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void mainClassNoEsNull() {
        assertNotNull(new ServicioTecnicoApplication());
    }

    @Test
    void restTemplateBeanNoEsNull() {
        assertNotNull(new ServicioTecnicoApplication().restTemplate());
    }
}
