package com.unipulse.backend.Repository;

import com.unipulse.backend.model.ReservationResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationResourceRepository extends JpaRepository<ReservationResource, Long> {

    List<ReservationResource> findByStatus(ReservationResource.ResourceStatus status);

    List<ReservationResource> findByType(ReservationResource.ResourceType type);

    List<ReservationResource> findByTypeAndStatus(ReservationResource.ResourceType type, ReservationResource.ResourceStatus status);

    @Query("SELECT r FROM ReservationResource r WHERE r.status = 'ACTIVE' AND " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<ReservationResource> searchActiveResources(
            @org.springframework.data.repository.query.Param("type") ReservationResource.ResourceType type,
            @org.springframework.data.repository.query.Param("location") String location
    );
}
