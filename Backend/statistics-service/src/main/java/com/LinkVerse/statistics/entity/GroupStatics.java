package com.LinkVerse.statistics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupStatics {
    @Id
    @Column(name = "group_id", nullable = false)
    private String groupId;

    private int memberCount;

    private GroupVisibility visibility;
    private LocalDateTime createdAt;

}