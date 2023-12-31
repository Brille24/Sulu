<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\SecurityBundle\Entity;

use Sulu\Component\Security\Authentication\RoleInterface;
use Sulu\Component\Security\Authorization\AccessControl\AccessControlInterface;

class AccessControl implements AccessControlInterface
{
    /**
     * @var int
     */
    private $id;

    /**
     * The role this access control rule is valid for.
     *
     * @var RoleInterface
     */
    private $role;

    /**
     * Holds the permissions as a bitmask.
     *
     * @var int
     */
    private $permissions;

    /**
     * The id of the model this access control rule applies to.
     *
     * @var string
     */
    private $entityId;

    /**
     * The id as integer representation of the model this access control rule applies to.
     *
     * @var int|null
     */
    private $entityIdInteger;

    /**
     * The class of the model this access control rule applies to.
     *
     * @var string
     */
    private $entityClass;

    public function getId()
    {
        return $this->id;
    }

    public function getRole()
    {
        return $this->role;
    }

    public function setRole($role)
    {
        $this->role = $role;
    }

    public function getPermissions()
    {
        return $this->permissions;
    }

    public function setPermissions($permissions)
    {
        $this->permissions = $permissions;
    }

    public function getEntityId()
    {
        if ($this->entityIdInteger) {
            return $this->entityIdInteger;
        }

        return $this->entityId;
    }

    public function setEntityId($entityId)
    {
        $this->entityId = (string) $entityId;

        if (\is_numeric($entityId)) {
            $this->entityIdInteger = (int) $entityId;
        }
    }

    public function getEntityClass()
    {
        return $this->entityClass;
    }

    public function setEntityClass($entityClass)
    {
        $this->entityClass = $entityClass;
    }
}
