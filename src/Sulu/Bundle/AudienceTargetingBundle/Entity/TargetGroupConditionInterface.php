<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\AudienceTargetingBundle\Entity;

/**
 * Interface for target group conditions.
 */
interface TargetGroupConditionInterface
{
    /**
     * @return int
     */
    public function getId();

    /**
     * @return string
     */
    public function getType();

    /**
     * @param string $type
     *
     * @return $this
     */
    public function setType($type);

    /**
     * @return mixed[]
     */
    public function getCondition();

    /**
     * @param mixed[] $condition
     *
     * @return $this
     */
    public function setCondition($condition);

    /**
     * @return TargetGroupRuleInterface
     */
    public function getRule();

    /**
     * @return $this
     */
    public function setRule(TargetGroupRuleInterface $rule);
}
